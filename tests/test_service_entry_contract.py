"""predict service entry contract tests."""

from predict.service_entry import build_doctor_payload, build_plan_payload


def test_plan_payload_has_registry_sections() -> None:
    payload = build_plan_payload()
    assert payload["service"] == "predict"
    assert payload["distribution_mode"] == "standalone"
    assert payload["host_contract"] == "external_plugin_adapter"
    assert payload["sources"]
    assert payload["datasets"]
    assert payload["legacy_services"]


def test_doctor_payload_marks_opinion_retired() -> None:
    payload = build_doctor_payload()
    checks = {item["name"]: item["status"] for item in payload["checks"]}
    assert checks["opinion_retired"] == "ok"
    assert checks["host_binding_externalized"] == "ok"
