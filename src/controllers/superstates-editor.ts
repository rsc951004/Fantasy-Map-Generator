import type { Superstate } from "@/generators/states-generator";
import { ensureEl, getRandomColor } from "@/utils";

const NO_SUPERSTATE: Superstate = {
  i: 0,
  name: "No superstate",
  fullName: "No superstate",
  color: "#999999"
};

function open(): void {
  if (customization) return;
  ensureData();
  closeDialogs("#superstatesEditor, .stable");
  render();

  $("#superstatesEditor").dialog({
    title: "Superstates Editor",
    width: Math.min(860, window.innerWidth - 40),
    resizable: false,
    position: { my: "right top", at: "right-10 top+10", of: "svg", collision: "fit" }
  });
}

function ensureData(): void {
  if (!pack.superstates?.length) pack.superstates = [{ ...NO_SUPERSTATE }];
  if (!pack.superstates[0]) pack.superstates[0] = { ...NO_SUPERSTATE };

  for (const state of pack.states) {
    if (!state.superstate) continue;
    const superstate = pack.superstates[state.superstate];
    if (!superstate || superstate.removed) state.superstate = undefined;
  }

  for (const superstate of pack.superstates) {
    if (!superstate.i || superstate.removed || !superstate.capitalState) continue;
    const capital = pack.states[superstate.capitalState];
    if (!capital || capital.removed || capital.superstate !== superstate.i) superstate.capitalState = undefined;
  }
}

function insertEditorHtml(): void {
  if (document.getElementById("superstatesEditor")) return;

  const html = /* html */ `<div id="superstatesEditor" class="dialog stable">
    <p style="margin: 0 0 0.6em">
      Superstates group states without replacing their diplomacy, economy, or military.
    </p>
    <div id="superstatesList"></div>
    <div style="display: flex; gap: 0.4em; margin: 0.7em 0">
      <button id="superstatesAdd" class="icon-plus">Create superstate</button>
      <button id="superstatesToggleLayer" class="icon-eye">Toggle layer</button>
    </div>
    <div class="separator">State assignments</div>
    <div id="superstatesAssignments" style="max-height: 36vh; overflow-y: auto"></div>
  </div>`;

  ensureEl("dialogs").insertAdjacentHTML("beforeend", html);
  ensureEl("superstatesAdd").on("click", addSuperstate);
  ensureEl("superstatesToggleLayer").on("click", () => toggleSuperstates());
  ensureEl("superstatesList").on("change", handleSuperstateChange);
  ensureEl("superstatesList").on("click", handleSuperstateClick);
  ensureEl("superstatesAssignments").on("change", handleAssignmentChange);
}

function render(): void {
  insertEditorHtml();
  const active = pack.superstates.filter(superstate => superstate.i && !superstate.removed);
  const escapeAttribute = (value: string) =>
    value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  const rows = active
    .map(superstate => {
      const members = pack.states.filter(state => state.i && !state.removed && state.superstate === superstate.i);
      const capitalOptions = [
        `<option value="0">No imperial capital</option>`,
        ...members.map(
          state =>
            `<option value="${state.i}" ${superstate.capitalState === state.i ? "selected" : ""}>${escapeAttribute(
              state.name
            )}</option>`
        )
      ].join("");

      return /* html */ `<div
        data-id="${superstate.i}"
        style="
          display: grid;
          grid-template-columns: 2.5em minmax(0, 1fr) minmax(0, 1.35fr) minmax(0, 1fr) max-content 2em;
          gap: 0.45em;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
          margin: 0.25em 0;
        "
      >
        <input
          class="superstateColor"
          type="color"
          value="${superstate.color}"
          data-tip="Superstate color"
          style="width:100%;min-width:0"
        />
        <input
          class="superstateName"
          value="${escapeAttribute(superstate.name)}"
          data-tip="Short name"
          style="width:100%;min-width:0;box-sizing:border-box"
        />
        <input
          class="superstateFullName"
          value="${escapeAttribute(superstate.fullName || superstate.name)}"
          data-tip="Full name"
          style="width:100%;min-width:0;box-sizing:border-box"
        />
        <select
          class="superstateCapital"
          data-tip="State containing the imperial capital"
          style="width:100%;min-width:0;box-sizing:border-box"
        >${capitalOptions}</select>
        <span data-tip="Member states count" style="white-space:nowrap">${members.length} state${members.length === 1 ? "" : "s"}</span>
        <button class="superstateRemove icon-trash-empty" data-tip="Remove superstate"></button>
      </div>`;
    })
    .join("");

  ensureEl("superstatesList").innerHTML = rows || "<p>No superstates are defined.</p>";

  const options = [
    `<option value="0">No superstate</option>`,
    ...active.map(superstate => `<option value="${superstate.i}">${escapeAttribute(superstate.name)}</option>`)
  ].join("");

  ensureEl("superstatesAssignments").innerHTML = pack.states
    .filter(state => state.i && !state.removed)
    .map(
      state => /* html */ `<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5em;margin:.2em 0">
        <span>${escapeAttribute(state.name)}</span>
        <select class="stateSuperstate" data-state="${state.i}">
          ${options.replace(`value="${state.superstate || 0}"`, `value="${state.superstate || 0}" selected`)}
        </select>
      </div>`
    )
    .join("");
}

function addSuperstate(): void {
  const i = pack.superstates.length;
  const name = `Superstate ${i}`;
  pack.superstates.push({ i, name, fullName: name, color: getRandomColor() });
  render();
  redraw();
}

function handleSuperstateChange(event: Event): void {
  const input = event.target as HTMLInputElement | HTMLSelectElement;
  const row = input.closest<HTMLElement>("[data-id]");
  if (!row) return;
  const superstate = pack.superstates[Number(row.dataset.id)];
  if (!superstate || superstate.removed) return;

  if (input.classList.contains("superstateColor")) superstate.color = input.value;
  else if (input.classList.contains("superstateName")) superstate.name = input.value.trim() || superstate.name;
  else if (input.classList.contains("superstateFullName")) superstate.fullName = input.value.trim() || superstate.name;
  else if (input.classList.contains("superstateCapital")) superstate.capitalState = Number(input.value) || undefined;

  render();
  redraw();
}

function handleSuperstateClick(event: Event): void {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".superstateRemove");
  if (!button) return;
  const row = button.closest<HTMLElement>("[data-id]");
  if (!row) return;
  const id = Number(row.dataset.id);
  const superstate = pack.superstates[id];
  if (!superstate || superstate.removed) return;

  superstate.removed = true;
  for (const state of pack.states) if (state.superstate === id) state.superstate = undefined;
  render();
  redraw();
}

function handleAssignmentChange(event: Event): void {
  const select = (event.target as HTMLElement).closest<HTMLSelectElement>(".stateSuperstate");
  if (!select) return;
  const state = pack.states[Number(select.dataset.state)];
  if (!state || state.removed) return;
  state.superstate = Number(select.value) || undefined;
  render();
  redraw();
}

function redraw(): void {
  if (!layerIsOn("toggleSuperstates")) return;
  const active = pack.superstates.some(superstate => superstate.i && !superstate.removed);
  if (active) drawSuperstates();
  else toggleSuperstates();
}

export const SuperstatesEditor = { open };
