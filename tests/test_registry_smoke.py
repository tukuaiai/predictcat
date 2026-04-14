"""predict registry smoke tests."""

from predict.registry import DATASETS, LEGACY_SERVICES, SOURCES, dataset_ids


def test_sources_cover_prediction_and_reference_venues() -> None:
    venue_names = {source.venue for source in SOURCES}
    assert {"kalshi", "polymarket", "binance"} <= venue_names


def test_dataset_registry_contains_research_outputs() -> None:
    ids = set(dataset_ids())
    assert "raw_http_snapshot" in ids
    assert "raw_ws_event" in ids
    assert "market_binance_mapping_dim" in ids
    assert "binance_um_price_history" in ids
    assert "predict_research_panel" in ids
    assert "cross_venue_market_link_dim" in ids


def test_opinion_is_retired() -> None:
    legacy_by_id = {service.service_id: service for service in LEGACY_SERVICES}
    assert legacy_by_id["opinion_bot"].status == "retired"
    assert legacy_by_id["polymarket_bot"].status == "legacy_active"
    assert legacy_by_id["kalshi_bot"].status == "legacy_active"


def test_dataset_registry_is_non_empty() -> None:
    assert len(DATASETS) >= 10
