# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-12-16

### Added
- **Chart Comparison**: Added ability to compare two instruments on the price chart.
- **Performance Mode**: Added a toggle to switch between Price ($) and Performance (%) views.
- **Premium Legend**: Added a styled, interactive legend for the chart comparison.
- **News Reader View**: Implemented a "Reader View" for news articles to bypass iframe restrictions.
- **Sentiment Analysis**: Added sentiment analysis cards with AI-driven insights.

### Changed
- Refactored `PriceChart` component into smaller, single-responsibility components (`ChartControls`, `ChartVisualizer`, `useChartData`).
- Improved chart tooltip to show data for both compared instruments.
- Updated `InstrumentPage` to use the new `PriceChart` component.

### Fixed
- Fixed `React.Children.only` error in `InstrumentNewsSentimentCard`.
- Fixed iframe connection issues by replacing it with the Reader View.
