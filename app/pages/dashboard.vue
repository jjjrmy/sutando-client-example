<template>
  <div class="pt-safe">
    <h1>Dashboard</h1>
    <p>Welcome to the dashboard</p>

    <section class="card">
      <div class="card-header">
        <h2>Notifications</h2>
      </div>
      <div class="grid">
        <div class="kv">
          <div class="k">Platform</div>
          <div class="v">{{ platformLabel }}</div>
        </div>
        <div class="kv">
          <div class="k">Permission</div>
          <div class="v">{{ permissionStatus }}</div>
        </div>
        <div class="kv token">
          <div class="k">Device token</div>
          <div class="v">
            <span>{{ maskedToken || "—" }}</span>
            <button
              class="btn btn-secondary"
              @click="() => copyToken()"
              :disabled="!deviceToken"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
      <div class="actions">
        <button class="btn" @click="() => requestAndRegister()">
          Enable & Register
        </button>
        <button class="btn" @click="() => requestAndRegister(true)">
          Re-register
        </button>
        <button
          class="btn"
          @click="() => sendTestNotification()"
          :disabled="!deviceToken"
        >
          Send test
        </button>
        <button class="btn btn-secondary" @click="() => resetPushListeners()">
          Reset listeners
        </button>
        <button class="btn btn-secondary" @click="() => openAppSettings()">
          Open Settings (iOS)
        </button>
        <button class="btn btn-danger" @click="() => (logs = [])">
          Clear logs
        </button>
      </div>
      <details class="advanced">
        <summary>Advanced</summary>
        <div class="advanced-actions">
          <button class="btn btn-secondary" @click="() => getDelivered()">
            Get delivered notifications
          </button>
        </div>
      </details>
    </section>

    <section class="card">
      <div class="card-header">
        <h2>Logs</h2>
      </div>
      <div class="logs" ref="logsEl">
        <pre>{{ logs.join("\n") }}</pre>
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <h2>Details</h2>
      </div>
      <details style="margin: 0.5rem 0">
        <summary>User</summary>
        <pre>{{ user }}</pre>
      </details>
      <details style="margin: 0.5rem 0">
        <summary>Subscriptions</summary>
        <pre>{{ subscriptions }}</pre>
      </details>
    </section>

    <NuxtLink to="/">Home</NuxtLink>
    <NuxtLink to="/products">Products</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

const { user, client } = useAuth();
const { data: subscriptions } = await client.subscription.list();

const logs = ref<string[]>([]);
const deviceToken = ref<string | null>(null);
let listenersRegistered = false;
const permissionStatus = ref<string>("unknown");
const platformLabel = ref<string>("unknown");
const logsEl = ref<HTMLElement | null>(null);

const maskedToken = computed(() =>
  deviceToken.value
    ? `${deviceToken.value.slice(0, 12)}…${deviceToken.value.slice(-6)}`
    : ""
);

function addLog(message: string) {
  const ts = new Date().toISOString();
  logs.value.unshift(`[${ts}] ${message}`);
  // keep logs manageable
  if (logs.value.length > 300) logs.value.length = 300;
  // best-effort autoscroll
  queueMicrotask(() => {
    if (logsEl.value) logsEl.value.scrollTop = 0;
  });
}

async function registerWithBackend(token: string, platform: "ios" | "android") {
  try {
    addLog(`Registering token with backend (${platform})...`);
    const cfg = useRuntimeConfig();
    const baseURL =
      (cfg.public as any)?.apiBaseUrl ||
      (cfg.public as any)?.appUrl ||
      undefined;
    const bearer = import.meta.client
      ? localStorage.getItem("bearer_token")
      : undefined;
    addLog(`Resolved baseURL: ${baseURL || "(none)"}, bearer set: ${!!bearer}`);

    const payload = {
      type: "push",
      token,
      identifier: token,
      platform,
    };
    addLog(
      `Payload: ${JSON.stringify({
        ...payload,
        token: token?.slice(0, 10) + "…",
      })}`
    );

    try {
      const { data, error, status } = await useDynamicFetch<any>(
        "/api/notify/register",
        {
          method: "POST",
          body: payload,
          onRequest({ request, options }) {
            const url =
              typeof request === "string"
                ? request
                : (request as any)?.toString?.() || "[object Request]";
            addLog(
              `onRequest -> url: ${url}, baseURL: ${
                (options as any)?.baseURL || "(none)"
              }`
            );
          },
          onRequestError({ error }) {
            addLog(`onRequestError -> ${error?.message || error}`);
          },
          onResponse({ response }) {
            addLog(`onResponse -> status: ${response.status}`);
          },
          onResponseError({ response }) {
            addLog(
              `onResponseError -> status: ${
                response?.status
              }, body: ${JSON.stringify((response as any)?._data)}`
            );
          },
        }
      );

      if (error.value) {
        addLog(
          `Backend register error [status=${status.value}]: ${
            error.value?.data?.message ||
            error.value?.message ||
            "unknown error"
          }`
        );
      } else {
        addLog(
          `Backend register ok [status=${status.value}]: ${JSON.stringify(
            data.value
          )}`
        );
      }
    } catch (fetchErr: any) {
      addLog(
        `useDynamicFetch threw -> ${fetchErr?.message || String(fetchErr)}`
      );
    }
  } catch (e: any) {
    addLog(`Backend register exception: ${e?.message || e}`);
  }
}

async function requestAndRegister(force: boolean = false) {
  try {
    if (!import.meta.client) return;

    const platform = Capacitor.getPlatform();
    addLog(`Platform: ${platform}`);
    const available = Capacitor.isPluginAvailable("PushNotifications");
    addLog(`Push plugin available: ${available}`);
    platformLabel.value = platform;

    if (platform === "web") {
      addLog("Push not available on web via Capacitor. Skipping.");
      return;
    }

    // Check permission
    let perm:
      | Awaited<ReturnType<typeof PushNotifications.checkPermissions>>
      | undefined;
    try {
      perm = await PushNotifications.checkPermissions();
      addLog(`Permission status: ${perm.receive}`);
      permissionStatus.value = String(perm.receive);
    } catch (perr: any) {
      addLog(`checkPermissions error: ${perr?.message || perr}`);
    }

    if (!perm || perm.receive !== "granted") {
      try {
        const req = await PushNotifications.requestPermissions();
        addLog(`Request permission result: ${req.receive}`);
        permissionStatus.value = String(req.receive);
        if (req.receive !== "granted") {
          addLog("Permission not granted. Cannot register for push.");
          return;
        }
      } catch (rqerr: any) {
        addLog(`requestPermissions error: ${rqerr?.message || rqerr}`);
        return;
      }
    } else if (!force) {
      // If already granted and we have a cached token, re-register it without forcing APNs flow
      const cached = localStorage.getItem("device_token");
      if (cached) {
        deviceToken.value = cached;
        addLog(`Using cached token: ${cached.substring(0, 12)}…`);
        await registerWithBackend(
          cached,
          platform === "ios" ? "ios" : "android"
        );
        return;
      }
    }

    // Listeners are already registered globally, just log status
    addLog(`Listeners registered: ${listenersRegistered}`);

    addLog("Calling PushNotifications.register()");
    // Trigger system registration
    try {
      await PushNotifications.register();
      addLog(
        "PushNotifications.register() resolved (this does not guarantee token event)"
      );
    } catch (regErr: any) {
      addLog(
        `PushNotifications.register() threw: ${regErr?.message || regErr}`
      );
    }

    // Fallback: if no registration event in 5s but we have a cached token, use it
    setTimeout(async () => {
      if (!deviceToken.value) {
        const cached = localStorage.getItem("device_token");
        if (cached) {
          addLog(
            "No registration event received; using cached token fallback."
          );
          deviceToken.value = cached;
          await registerWithBackend(
            cached,
            platform === "ios" ? "ios" : "android"
          );
        } else {
          addLog("No registration event and no cached token available.");
        }
      }
    }, 8000);
  } catch (e: any) {
    addLog(`requestAndRegister exception: ${e?.message || e}`);
  }
}

async function resetPushListeners() {
  try {
    addLog("Removing all PushNotifications listeners...");
    await PushNotifications.removeAllListeners();
    addLog("All push listeners removed.");
    listenersRegistered = false;
  } catch (e: any) {
    addLog(`resetPushListeners exception: ${e?.message || e}`);
  }
}

async function openAppSettings() {
  try {
    if (!import.meta.client) return;
    if (Capacitor.getPlatform() !== "ios") {
      addLog("Open settings is iOS-specific here.");
      return;
    }
    addLog("Opening iOS App Settings...");
    const opened = window.open("app-settings:", "_self");
    if (!opened) {
      addLog("Unable to open settings via URL scheme.");
    }
  } catch (e: any) {
    addLog(`openAppSettings exception: ${e?.message || e}`);
  }
}

async function getDelivered() {
  try {
    const res = await PushNotifications.getDeliveredNotifications();
    addLog(`Delivered notifications: ${JSON.stringify(res)}`);
  } catch (e: any) {
    addLog(`getDelivered error: ${e?.message || e}`);
  }
}

async function copyToken() {
  try {
    if (!deviceToken.value) return;
    await navigator.clipboard.writeText(deviceToken.value);
    addLog("Token copied to clipboard");
  } catch (e: any) {
    addLog(`copyToken error: ${e?.message || e}`);
  }
}

async function sendTestNotification() {
  try {
    addLog("Sending test notification (broadcast: push)…");
    const { data, error, status } = await useDynamicFetch<any>(
      "/api/notify/send",
      {
        method: "POST",
        body: {
          broadcast: true,
          types: ["push"],
          title: "Hello 👋",
          body: "This is a test notification",
        },
      }
    );
    if (error.value) {
      addLog(
        `Test notify failed [status=${status.value}]: ${
          error.value?.message || JSON.stringify(error.value)
        }`
      );
    } else {
      addLog(
        `Test notify sent [status=${status.value}]: ${JSON.stringify(
          data.value
        )}`
      );
    }
  } catch (e: any) {
    addLog(`sendTestNotification exception: ${e?.message || e}`);
  }
}

// Register listeners immediately before component mounts
if (import.meta.client && Capacitor.getPlatform() !== "web") {
  PushNotifications.addListener("registration", async (token) => {
    console.log("Push registration event received:", token);
    deviceToken.value = token.value;
    localStorage.setItem("device_token", token.value);
    addLog(`Received token: ${token.value}`);
    const platform = Capacitor.getPlatform();
    await registerWithBackend(
      token.value,
      platform === "ios" ? "ios" : "android"
    );
  });

  PushNotifications.addListener("registrationError", (err) => {
    console.error("Push registration error:", err);
    addLog(`Registration error: ${JSON.stringify(err)}`);
  });

  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log("Push notification received:", notification);
    addLog(`Push received (foreground): ${JSON.stringify(notification)}`);
  });

  PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    console.log("Push notification action performed:", action);
    addLog(`Push action performed: ${JSON.stringify(action)}`);
  });

  listenersRegistered = true;
  console.log("Push listeners registered globally");
}

onMounted(async () => {
  // Try to auto-register on mount (non-blocking)
  addLog("Dashboard mounted, checking push notifications...");

  // Add a small delay to ensure everything is initialized
  setTimeout(() => {
    requestAndRegister(false);
  }, 100);
});
</script>

<style scoped>
.card {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  margin: 1rem 0;
  background: #fff;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.kv {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  border: 1px dashed #e5e7eb;
  border-radius: 0.5rem;
}
.kv .k {
  font-size: 0.8rem;
  color: #6b7280;
}
.kv .v {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  word-break: break-all;
}
.kv.token .v {
  justify-content: space-between;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.advanced {
  margin-top: 0.5rem;
}
.advanced-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.logs {
  max-height: 280px;
  overflow: auto;
  background: #0b1021;
  color: #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #111827;
}
.logs pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85rem;
}
.btn {
  padding: 0.5rem 0.9rem;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  border-radius: 0.5rem;
  cursor: pointer;
}
.btn:hover {
  background: #f3f4f6;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  background: #f3f4f6;
}
.btn-danger {
  background: #fee2e2;
  border-color: #fecaca;
}
</style>
