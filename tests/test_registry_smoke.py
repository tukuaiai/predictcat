"""predict registry smoke tests."""

from predict.registry import DATASETS, LEGACY_SERVICES, SOURCES, dataset_ids


def test_sources_cover_both_venues() -> None:
    venue_names = {source.venue for source in SOURCES}
    assert venue_names == {"kalshi", "polymarket"}


def test_dataset_registry_contains_research_outputs() -> None:
    ids = set(dataset_ids())
    assert "market_binance_mapping_dim" in ids
    assert "predict_research_panel" in ids
    assert "cross_venue_market_link_dim" in ids


def test_opinion_is_retired() -> None:
    legacy_by_id = {service.service_id: service for service in LEGACY_SERVICES}
    assert legacy_by_id["opinion_bot"].status == "retired"
    assert legacy_by_id["polymarket_bot"].status == "legacy_active"
    assert legacy_by_id["kalshi_bot"].status == "legacy_active"


def test_dataset_registry_is_non_empty() -> None:
    assert len(DATASETS) >= 10
