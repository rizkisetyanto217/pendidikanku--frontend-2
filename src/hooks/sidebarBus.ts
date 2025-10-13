// src/hooks/sidebarBus.ts
export const openSidebarEvt = "studentSidebar:open";
export const closeSidebarEvt = "studentSidebar:close";

export function openSidebar() {
  window.dispatchEvent(new Event(openSidebarEvt));
}
export function closeSidebar() {
  window.dispatchEvent(new Event(closeSidebarEvt));
}
