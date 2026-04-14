"""predict 控制面配置。"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path


@dataclass(frozen=True)
class PredictServiceConfig:
    """dataset-first 控制面基础配置。"""

    service_name: str
    service_root: Path
    src_root: Path
    docs_root: Path
    legacy_root: Path
    runtime_group: str
    distribution_mode: str
    host_contract: str

    def to_dict(self) -> dict[str, str]:
        payload = asdict(self)
        return {key: str(value) for key, value in payload.items()}


def load_config() -> PredictServiceConfig:
    """返回本服务的稳定路径与控制面配置。"""

    service_root = Path(__file__).resolve().parents[2]
    src_root = service_root / "src" / "predict"
    docs_root = service_root / "docs"
    legacy_root = service_root / "services"
    return PredictServiceConfig(
        service_name="predict",
        service_root=service_root,
        src_root=src_root,
        docs_root=docs_root,
        legacy_root=legacy_root,
        runtime_group="dataset-first",
        distribution_mode="standalone",
        host_contract="external_plugin_adapter",
    )
