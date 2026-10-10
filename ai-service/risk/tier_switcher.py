"""
Visonix - shared Tier 1 / Tier 2 hysteresis switching state machine (v3).

v3 fix: CSRNet (PartA weights, dense-trained) overcounts on sparse scenes.
Changes vs v2:
  1. CSRNet can only trigger CSRNET mode if YOLO also sees >= MIN_YOLO_TO_TRUST_CSRNET people.
  2. CSRNet entry needs CSRNET_ENTER_CONFIRM consecutive confirmations (was 1).
  3. While in CSRNET mode, if YOLO sees < SPARSE_YOLO_FLOOR for SPARSE_EXIT_FRAMES
     frames in a row, exit - the scene is clearly sparse, CSRNet is overcounting.
"""

import time

# ---------------------------------------------------------------------------
# CONFIG - tune on your own footage
# ---------------------------------------------------------------------------
try:
    from risk_engine import CSRNET_SWITCH_COUNT        # run as script from risk/ folder
except ImportError:
    from .risk_engine import CSRNET_SWITCH_COUNT       # imported as a package

ENTER_THRESHOLD = CSRNET_SWITCH_COUNT   # 40, defined in risk_engine.py
EXIT_THRESHOLD = 20
REQUIRED_CONSECUTIVE_FRAMES = 3
PERIODIC_CHECK_INTERVAL_SEC = 4

MIN_YOLO_TO_TRUST_CSRNET = 8     # YOLO must see at least this many for CSRNet "dense" to count
CSRNET_ENTER_CONFIRM = 3         # consecutive CSRNet readings >= ENTER_THRESHOLD needed
SPARSE_YOLO_FLOOR = 8            # YOLO below this = scene looks sparse
SPARSE_EXIT_FRAMES = 10          # frames of "YOLO says sparse" before forcing exit


class TierSwitcher:
    def __init__(self):
        self.mode = "YOLO"
        self.consec_above_enter = 0
        self.consec_below_exit = 0
        self.consec_csrnet_confirm = 0
        self.consec_yolo_sparse = 0
        self._last_yolo = 0
        self._last_periodic_check = None

    def decide(self, yolo_count: int, current_time: float = None):
        now = current_time if current_time is not None else time.time()
        self._last_yolo = yolo_count

        if self._last_periodic_check is None:
            periodic_due = True
            self._last_periodic_check = now
        else:
            periodic_due = (now - self._last_periodic_check) >= PERIODIC_CHECK_INTERVAL_SEC
            if periodic_due:
                self._last_periodic_check = now

        was_yolo_mode = (self.mode == "YOLO")

        if self.mode == "YOLO":
            self.consec_above_enter = self.consec_above_enter + 1 if yolo_count >= ENTER_THRESHOLD else 0
            if self.consec_above_enter >= REQUIRED_CONSECUTIVE_FRAMES:
                self._enter_csrnet_mode()
        else:
            # YOLO sanity check: clearly sparse scene -> CSRNet is overcounting
            self.consec_yolo_sparse = self.consec_yolo_sparse + 1 if yolo_count < SPARSE_YOLO_FLOOR else 0
            if self.consec_yolo_sparse >= SPARSE_EXIT_FRAMES:
                self._exit_csrnet_mode()

        # Keep running CSRNet on following frames while confirming a pending entry
        pending_confirm = self.mode == "YOLO" and self.consec_csrnet_confirm > 0

        if self.mode == "CSRNET" and was_yolo_mode:
            reason = "threshold"
        elif self.mode == "CSRNET":
            reason = "sustained"
        elif periodic_due or pending_confirm:
            reason = "periodic"
        else:
            reason = "none"

        run_csrnet_now = (self.mode == "CSRNET") or periodic_due or pending_confirm
        return run_csrnet_now, reason

    def report_csrnet_result(self, csrnet_count: int):
        if self.mode == "YOLO":
            plausible = (csrnet_count >= ENTER_THRESHOLD
                         and self._last_yolo >= MIN_YOLO_TO_TRUST_CSRNET)
            self.consec_csrnet_confirm = self.consec_csrnet_confirm + 1 if plausible else 0
            if self.consec_csrnet_confirm >= CSRNET_ENTER_CONFIRM:
                self._enter_csrnet_mode()

        elif self.mode == "CSRNET":
            self.consec_below_exit = self.consec_below_exit + 1 if csrnet_count < EXIT_THRESHOLD else 0
            if self.consec_below_exit >= REQUIRED_CONSECUTIVE_FRAMES:
                self._exit_csrnet_mode()

    def _reset_counters(self):
        self.consec_above_enter = 0
        self.consec_below_exit = 0
        self.consec_csrnet_confirm = 0
        self.consec_yolo_sparse = 0

    def _enter_csrnet_mode(self):
        self.mode = "CSRNET"
        self._reset_counters()

    def _exit_csrnet_mode(self):
        self.mode = "YOLO"
        self._reset_counters()