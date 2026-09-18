"""
Visonix - shared Tier 1 / Tier 2 hysteresis switching state machine.

Used by BOTH crowd_monitor.py (live camera) and crowd_monitor_video.py
(recorded video testing), so the switching logic only lives in one place.

DESIGN NOTE (v2 - fixed after a real bug found on test footage):
A periodic safety-check that reveals a dense scene must actually change the
mode, not just report a number for one frame and be forgotten. And once in
CSRNET mode, the EXIT decision must be based on CSRNet's own count, not
YOLO's - because YOLO is exactly the signal we've already proven unreliable
in dense, occluded scenes (that's the whole reason CSRNet exists). Using
YOLO's count as the exit condition would cause an immediate flip back out
the instant the periodic check flips it in.
"""

import time

# ---------------------------------------------------------------------------
# CONFIG - tune these on your own test footage. These are starting points.
# ---------------------------------------------------------------------------
ENTER_THRESHOLD = 30                # count (YOLO OR CSRNet) that triggers/confirms CSRNET mode
EXIT_THRESHOLD = 20                 # CSRNet's own count must drop below this to exit CSRNET mode
REQUIRED_CONSECUTIVE_FRAMES = 3     # debounce - avoid a single noisy frame causing a switch
PERIODIC_CHECK_INTERVAL_SEC = 4     # mandatory CSRNet check while in YOLO mode, regardless of YOLO's count


class TierSwitcher:
    """Hysteresis + cooldown + periodic-safety-check state machine.

    Usage per processed frame:
        run_csrnet, reason = switcher.decide(yolo_count, current_time=...)
        if run_csrnet:
            csrnet_count = <run CSRNet>
            switcher.report_csrnet_result(csrnet_count)   # <-- required, closes the loop
    """

    def __init__(self):
        self.mode = "YOLO"  # or "CSRNET"
        self.consec_above_enter = 0
        self.consec_below_exit = 0
        self._last_periodic_check = None  # set on first decide() call

    def decide(self, yolo_count: int, current_time: float = None):
        """
        Call once per processed frame with the latest YOLO count, BEFORE running CSRNet.

        current_time: seconds, drives the periodic-check timer.
          - Live camera: omit - uses wall-clock time.time().
          - Video file: pass frame_num / fps, so "every N seconds" means N seconds
            of VIDEO content, not N seconds of actual processing time.

        Returns (run_csrnet_now: bool, reason: str):
          'threshold' - YOLO's own count just crossed ENTER_THRESHOLD (fast path,
                        works when YOLO is still reasonably reliable)
          'periodic'  - safety-net peek while still nominally trusting YOLO
          'sustained' - already confirmed dense, continuing to track with CSRNet
          'none'      - not running CSRNet this frame
        """
        now = current_time if current_time is not None else time.time()
        if self._last_periodic_check is None:
            self._last_periodic_check = now

        periodic_due = (now - self._last_periodic_check) >= PERIODIC_CHECK_INTERVAL_SEC
        if periodic_due:
            self._last_periodic_check = now

        was_yolo_mode = (self.mode == "YOLO")

        if self.mode == "YOLO":
            self.consec_above_enter = self.consec_above_enter + 1 if yolo_count >= ENTER_THRESHOLD else 0
            if self.consec_above_enter >= REQUIRED_CONSECUTIVE_FRAMES:
                self._enter_csrnet_mode()

        if self.mode == "CSRNET" and was_yolo_mode:
            reason = "threshold"   # just entered this frame, via YOLO's own rising count
        elif self.mode == "CSRNET":
            reason = "sustained"   # already confirmed dense, continuing to track
        elif periodic_due:
            reason = "periodic"    # safety-net peek - mode may still flip via report_csrnet_result()
        else:
            reason = "none"

        run_csrnet_now = (self.mode == "CSRNET") or periodic_due
        return run_csrnet_now, reason

    def report_csrnet_result(self, csrnet_count: int):
        """
        Call AFTER actually running CSRNet (whatever the reason), with the real
        measured count. This is what lets a periodic check that reveals a genuinely
        dense scene - one YOLO's own count would never have caught - actually latch
        the system into CSRNET mode, instead of the result being discarded after
        one frame. It's also what governs exiting CSRNET mode, using CSRNet's own
        (trustworthy) count rather than YOLO's.
        """
        if self.mode == "YOLO":
            if csrnet_count >= ENTER_THRESHOLD:
                self._enter_csrnet_mode()

        elif self.mode == "CSRNET":
            self.consec_below_exit = self.consec_below_exit + 1 if csrnet_count < EXIT_THRESHOLD else 0
            if self.consec_below_exit >= REQUIRED_CONSECUTIVE_FRAMES:
                self._exit_csrnet_mode()

    def _enter_csrnet_mode(self):
        self.mode = "CSRNET"
        self.consec_above_enter = 0
        self.consec_below_exit = 0

    def _exit_csrnet_mode(self):
        self.mode = "YOLO"
        self.consec_above_enter = 0
        self.consec_below_exit = 0