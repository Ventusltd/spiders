# estate-menu — version history

Every generation is a 12-digit UTC stamp read from the clock at the moment of
publishing, never typed. The module publishes the same stamp as
`window.__VENTUS_ESTATE_MENU__.version`, so a page can say which menu it is
running. Newest first. A bad generation is never repaired in place; the next
one supersedes it and says why.

| generation | what changed | why |
|---|---|---|
| **202609042305** | The VENTUS wordmark is back in the middle, reading V8's own text — VENTUS over Cables & Connectivity® — at the live gridatlas bar's sizes; the six menus stay together as one group beside it; on a phone the wordmark keeps the centre of its own row and the menus run beneath. All "estate" wording removed from what a reader sees. `version` is now this stamp. | The architect: "keep the logo as per V8", "Ventus logo is the main event, must be in the middle of the app", "keep it as it is, don't do it again — just the menus are the additions". Measured centred to the pixel: 700 of 1400, 195 of 390. |
| 202609042250 | The six titles made contiguous — logo first, then FILE EDIT VIEW SCOPE GRID ABOUT unbroken. | "Have all the menus together, not split with the Ventus logo, but keep the logo." Superseded above: the logo was moved to the left and its sub-line reworded, neither of which was asked for. |
| 202609042140 | First publication. One shared module rendering the gridatlas menu bar on any surface; `mount()` refuses where a host bar exists; every URL in the manifest probed 200. | "Seamlessly navigate the entire estate from globalgrid2050.com to pipelinenews versions, gridatlas, federation map." |
