// src/lib/device.ts
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  const key = "replayd_device";
  let v = localStorage.getItem(key);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(key, v);
  }
  return v;
}
