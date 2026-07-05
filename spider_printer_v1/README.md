# Spider Printer v1

Spider Printer v1 is a dark SCADA-style, browser-based, printable topological construction map for the GlobalGrid2050 federation.

It is deliberately not geospatial. It is a high-altitude single-line diagram for repositories, data spines, applications, engines, standards, infrastructure and external authorities.

## Live path

When GitHub Pages is enabled for the `spiders` repository, this app should load at:

```text
https://ventusltd.github.io/spiders/spider_printer_v1/
```

## Files

```text
spider_printer_v1/
  index.html              Browser app
  data/topology.json      Static topology cartridge
  README.md               Species notes
```

## Controls

- Drag to pan
- Mouse wheel to zoom
- Layer cartridges on the left
- View presets for full federation, data spine, apps and authorities
- Print button for A1 landscape output

## Operating law

This is a screening-grade topology printer. It does not certify engineering truth. It is designed to help humans and AI agents understand the repository federation without repeatedly re-explaining the structure.

## Cartridge model

`data/topology.json` is the first cartridge. Future cartridges can add:

- exact federation scanner output
- DNO/TSO source graph
- application-only graph
- audit/provenance graph
- supply-chain graph
- future repo placeholders

The app should remain stable while cartridges change.
