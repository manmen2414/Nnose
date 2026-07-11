import { clearDB, getConfig, saveConfig, setNoseCount } from "./db";

export function setupSettings() {
  const settingsPanel: HTMLDivElement | null =
    document.querySelector("#settings-panel");
  if (!settingsPanel) throw new Error("#settings-panel is not found");
  const openSettings: HTMLButtonElement | null =
    document.querySelector("#open-settings");
  if (!openSettings) throw new Error("#open-settings is not found");
  openSettings.onclick = () => (settingsPanel.style.display = "block");
  const closeSettings: HTMLButtonElement | null =
    document.querySelector("#close-settings");
  if (!closeSettings) throw new Error("#close-settings is not found");
  closeSettings.onclick = () => (settingsPanel.style.display = "none");
  const offset: HTMLInputElement | null = document.querySelector("#offset");
  if (!offset) throw new Error("#offset is not found");
  offset.onchange = () =>
    getConfig().then((c) =>
      saveConfig({ ...c, offset: parseInt(offset.value || "0") }),
    );
  const resetNose: HTMLButtonElement | null =
    document.querySelector("#reset-nose");
  if (!resetNose) throw new Error("#reset-nose is not found");
  resetNose.onclick = () => setNoseCount().then(() => location.reload());
  const resetAll: HTMLButtonElement | null =
    document.querySelector("#reset-all");
  if (!resetAll) throw new Error("#reset-all is not found");
  resetAll.onclick = () => clearDB().then(() => location.reload());
}
