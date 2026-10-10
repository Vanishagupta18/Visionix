"""
Visonix - Risk Engine.

Combines multiple signals into one 0-100 risk score with a
Safe / Warning / High Risk / Critical label.

DENSITY (v2): uses people-per-square-metre, not raw headcount. Raw count
alone is scientifically wrong for crowd risk - 180 people in a football
stadium and 180 people in a small hall are completely different risk
situations. Real crowd-safety engineering uses density (people/m^2):
  < 2 people/m^2   -> comfortable, safe (UK event safety guidance upper limit)
  2-4 people/m^2   -> busy, still manageable, people move independently
  4-5 people/m^2   -> critical - crowd flow begins to fail
  > 5 people/m^2   -> "crowd turbulence" - dangerous, crush risk
Source: Fruin's Level of Service (Fruin, 1993); G. Keith Still, gkstill.com;
Helbing & Mukerji (2012).

This needs the real-world area (in square metres) that the camera's frame
covers. ZONE_AREA_SQM below is a placeholder - measure your actual demo
space (pace it out or tape-measure length x width) and set it per zone.
Simplifying assumption: the camera's field of view = the whole monitored
zone. Full automatic camera calibration (pixels -> real-world area via
camera height/angle or a homography) is future work, not needed for a
first working version.

CURRENT STATE: only density_score is wired to a real signal (the count you
already get from YOLO or CSRNet via tier_switcher.py). weapon_score and
motion_score are stubs that default to "nothing detected" - wire in real
values once the weapon detector and motion-spike module exist.
"""

# Weights - must sum to 1.0.
#
# CURRENT PHASE: only density (crowd count) is a real, built signal - weapon
# and motion detectors don't exist yet. So their weight is 0 for now.
# ONCE the weapon detector and motion module are built, switch to:

# YOLO -> CSRNet model switch point (people seen by YOLO)

CSRNET_SWITCH_COUNT = 40

#   WEIGHT_DENSITY = 0.4 ; WEIGHT_MOTION = 0.3 ; WEIGHT_WEAPON = 0.3
WEIGHT_DENSITY = 1.0
WEIGHT_MOTION = 0.0
WEIGHT_WEAPON = 0.0



# --- Measure this for your actual demo room/zone before presenting ---
# Pace it out (~0.75m per adult step) or tape-measure length x width.
# Example: a 10m x 6m hall = 60.0
ZONE_AREA_SQM = 60.0

# Density thresholds (people per square metre) - see module docstring for sources.
DENSITY_SAFE = 2.0       # <= this: comfortable
DENSITY_WARNING = 4.0    # <= this: busy but manageable
DENSITY_CRITICAL = 5.0   # <= this: critical (crowd flow failing); above: crowd turbulence


def density_score(count: int, zone_area_sqm: float = ZONE_AREA_SQM) -> float:
    """0-100, based on people/m^2 against real crowd-safety thresholds -
    NOT raw headcount. Same count means different risk in different spaces."""
    if zone_area_sqm <= 0:
        raise ValueError("zone_area_sqm must be a positive number - measure the actual monitored area")

    density = count / zone_area_sqm  # people per square metre - the real safety metric

    if density <= DENSITY_SAFE:
        return (density / DENSITY_SAFE) * 30
    elif density <= DENSITY_WARNING:
        span = DENSITY_WARNING - DENSITY_SAFE
        return 30 + ((density - DENSITY_SAFE) / span) * 30
    elif density <= DENSITY_CRITICAL:
        span = DENSITY_CRITICAL - DENSITY_WARNING
        return 60 + ((density - DENSITY_WARNING) / span) * 25
    else:
        over = density - DENSITY_CRITICAL
        return min(100.0, 85 + (over / (over + 3)) * 15)


def motion_score(motion_ratio: float = 1.0) -> float:
    """
    motion_ratio = current motion magnitude / rolling baseline. 1.0 = normal.
    STUB - always returns 0 until the optical-flow motion module is built.
    """
    if motion_ratio <= 1.2:
        return 0.0
    return min(100.0, (motion_ratio - 1.0) * 40)


def weapon_score(weapon_detected: bool = False, confidence: float = 0.0) -> float:
    """
    STUB - always returns 0 until the fine-tuned weapon YOLO model is wired in.
    Binary for now; could be graded by confidence later.
    """
    return 100.0 if weapon_detected else 0.0


def compute_risk(count: int, zone_area_sqm: float = ZONE_AREA_SQM, motion_ratio: float = 1.0,
                  weapon_detected: bool = False, weapon_confidence: float = 0.0):
    """Returns (risk_score: float 0-100, label: str, breakdown: dict)."""
    d = density_score(count, zone_area_sqm)
    m = motion_score(motion_ratio)
    w = weapon_score(weapon_detected, weapon_confidence)

    risk = WEIGHT_DENSITY * d + WEIGHT_MOTION * m + WEIGHT_WEAPON * w
    risk = round(min(100.0, max(0.0, risk)), 1)

    if risk <= 30:
        label = "Safe"
    elif risk <= 60:
        label = "Warning"
    elif risk <= 80:
        label = "High Risk"
    else:
        label = "Critical"

    breakdown = {
        "density_score": round(d, 1),
        "motion_score": round(m, 1),
        "weapon_score": round(w, 1),
        "people_per_sqm": round(count / zone_area_sqm, 2),
        "zone_area_sqm": zone_area_sqm,
    }
    return risk, label, breakdown


if __name__ == "__main__":
    # 1. Sanity check across counts, at the default (demo) zone area
    print(f"Zone area = {ZONE_AREA_SQM} m^2")
    print(f"{'count':>6} {'ppl/m2':>7} {'risk':>7} {'label':>10}")
    for count in [1, 5, 25, 47, 60, 100, 180, 250]:
        risk, label, parts = compute_risk(count)
        print(f"{count:6d} {parts['people_per_sqm']:7.2f} {risk:7.1f} {label:>10}")

    # 2. THE ACTUAL ANSWER TO YOUR FACULTY: same count, different space
    print()
    print("Same count (180 people), three different room sizes:")
    for area in [30, 60, 150]:
        risk, label, parts = compute_risk(180, zone_area_sqm=area)
        print(f"  area={area:4d} m^2  ->  {parts['people_per_sqm']:.2f} people/m^2  "
              f"->  risk={risk:5.1f}%  ({label})")

    print()
    print("Same count (47), but with a weapon also detected:")
    risk, label, parts = compute_risk(47, weapon_detected=True)
    print(f"  risk={risk}  label={label}  breakdown={parts}")