"""predict 控制面审计摘要。"""

from __future__ import annotations

from ..config import load_config
from ..registry import DATASETS, LEGACY_SERVICES, SOURCES


def build_audit_snapshot() -> dict[str, object]:
    """输出当前骨架的最小审计摘要。"""

    config = load_config()
    active_legacy = [item.service_id for item in LEGACY_SERVICES if item.status == "legacy_active"]
    retired_legacy = [item.service_id for item in LEGACY_SERVICES if item.status == "retired"]
    return {
        "service": config.service_name,
        "runtime_group": config.runtime_group,
        "sources_count": len(SOURCES),
        "datasets_count": len(DATASETS),
        "active_legacy_services": active_legacy,
        "retired_legacy_services": retired_legacy,
        "status": "phase0_control_plane_ready",
    }
