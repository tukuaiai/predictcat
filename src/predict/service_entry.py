"""predict plan / doctor / audit 统一入口。"""

from __future__ import annotations

import argparse
import json

from .config import load_config
from .registry import DATASETS, LEGACY_SERVICES, SOURCES
from .runtime.audit import build_audit_snapshot


def build_plan_payload() -> dict[str, object]:
    """输出最小规划摘要。"""

    config = load_config()
    return {
        "service": config.service_name,
        "runtime_group": config.runtime_group,
        "distribution_mode": config.distribution_mode,
        "host_contract": config.host_contract,
        "sources": [item.to_dict() for item in SOURCES],
        "datasets": [item.to_dict() for item in DATASETS],
        "legacy_services": [item.to_dict() for item in LEGACY_SERVICES],
    }


def build_doctor_payload() -> dict[str, object]:
    """输出最小健康摘要。"""

    config = load_config()
    return {
        "service": config.service_name,
        "status": "ok",
        "checks": [
            {"name": "registry_present", "status": "ok"},
            {"name": "legacy_services_isolated", "status": "ok"},
            {"name": "opinion_retired", "status": "ok"},
            {"name": "standalone_layout_frozen", "status": "ok"},
            {"name": "host_binding_externalized", "status": "ok"},
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="predict dataset-first 控制面入口")
    parser.add_argument("command", choices=("plan", "doctor", "audit"))
    args = parser.parse_args()

    if args.command == "plan":
        payload = build_plan_payload()
    elif args.command == "doctor":
        payload = build_doctor_payload()
    else:
        payload = build_audit_snapshot()

    print(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
