import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineCpuChip,
  HiOutlineBattery100,
  HiOutlineArrowPath,
  HiOutlineCheck,
  HiOutlineExclamationTriangle,
  HiOutlineBellAlert,
  HiOutlineWifi,
} from "react-icons/hi2";

export const Route = createFileRoute("/device")({
  component: DevicePage,
  head: () => ({ meta: [{ title: "Device Info — NeuroSense AI" }] }),
});

interface DeviceInfo {
  name: string;
  value: string;
  icon: React.ReactNode;
}

function DevicePage() {
  const [updating, setUpdating] = useState(false);

  const deviceSpecs: DeviceInfo[] = [
    { name: "Model", value: "NS-AX-2041", icon: <HiOutlineCpuChip className="h-5 w-5" /> },
    { name: "Serial Number", value: "NS-EMG-0042-2024", icon: <HiOutlineBellAlert className="h-5 w-5" /> },
    { name: "Firmware Version", value: "2.4.1", icon: <HiOutlineArrowPath className="h-5 w-5" /> },
    { name: "Hardware Revision", value: "PCB-v3.2", icon: <HiOutlineCpuChip className="h-5 w-5" /> },
  ];

  const statusItems = [
    { label: "Device Status", value: "Connected", status: "online" },
    { label: "Bluetooth", value: "Active (4.2)", status: "active" },
    { label: "Battery", value: "92%", status: "good" },
    { label: "Signal Quality", value: "Excellent", status: "good" },
    { label: "Temperature", value: "34.2°C", status: "normal" },
    { label: "Uptime", value: "47d 14h 32m", status: "normal" },
  ];

  const sensorStats = [
    { name: "EMG Channels", value: "8", status: "active" },
    { name: "Accelerometers", value: "3-axis", status: "active" },
    { name: "Gyroscopes", value: "3-axis", status: "active" },
    { name: "Thermistor", value: "Calibrated", status: "active" },
  ];

  const handleFirmwareUpdate = () => {
    setUpdating(true);
    setTimeout(() => setUpdating(false), 3000);
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Hardware</div>
        <h1 className="mt-1 text-2xl font-semibold">About Device</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete hardware information, sensor status, and device management for your NeuroSense AX-2041 system.
        </p>
      </header>

      {/* Device Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-border/50 p-6 lg:p-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Device Connection Status</h2>
            <p className="mt-1 text-sm text-muted-foreground">Last sync: 2 minutes ago</p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-xl bg-success/15 px-4 py-3 border border-success/30">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-success/75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-success"></span>
            </span>
            <span className="font-medium text-success">Connected</span>
          </div>
        </div>
      </motion.div>

      {/* Device Specifications */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-border/50 p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">Device Specifications</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {deviceSpecs.map((spec, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-background/20 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                  {spec.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-muted-foreground">{spec.name}</div>
                  <div className="mt-0.5 truncate font-semibold">{spec.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Sensor Status */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Status Items */}
        <div className="glass rounded-2xl border border-border/50 p-6">
          <h2 className="mb-4 text-lg font-semibold">System Status</h2>
          <div className="space-y-3">
            {statusItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/20 px-4 py-3">
                <span className="text-sm font-medium">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{item.value}</span>
                  {item.status === "online" ? (
                    <span className="inline-flex h-2 w-2 rounded-full bg-success"></span>
                  ) : item.status === "active" ? (
                    <span className="inline-flex h-2 w-2 rounded-full bg-primary"></span>
                  ) : (
                    <span className="inline-flex h-2 w-2 rounded-full bg-muted"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sensors */}
        <div className="glass rounded-2xl border border-border/50 p-6">
          <h2 className="mb-4 text-lg font-semibold">Active Sensors</h2>
          <div className="space-y-3">
            {sensorStats.map((sensor, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/20 px-4 py-3">
                <span className="text-sm font-medium">{sensor.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{sensor.value}</span>
                  <HiOutlineCheck className="h-4 w-4 text-success" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Connections */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-border/50 p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">Connection Interfaces</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { name: "Bluetooth LE", status: "Connected", icon: <HiOutlineWifi className="h-5 w-5" /> },
            { name: "WiFi", status: "Connected (5GHz)", icon: <HiOutlineWifi className="h-5 w-5" /> },
            { name: "USB-C", status: "Not Connected", icon: <HiOutlineBattery100 className="h-5 w-5" /> },
            { name: "NFC", status: "Ready", icon: <HiOutlineBellAlert className="h-5 w-5" /> },
          ].map((conn, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-border/50 bg-background/20 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                {conn.icon}
              </div>
              <div>
                <div className="text-sm font-medium">{conn.name}</div>
                <div className="text-xs text-muted-foreground">{conn.status}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Firmware Update */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-border/50 p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Firmware Update</h2>
            <p className="mt-1 text-sm text-muted-foreground">Current version is up to date</p>
          </div>
          <button
            onClick={handleFirmwareUpdate}
            disabled={updating}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground glow-primary disabled:opacity-60"
          >
            {updating ? (
              <>
                <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <HiOutlineArrowPath className="h-4 w-4" />
                Check for Updates
              </>
            )}
          </button>
        </div>
      </motion.section>
    </div>
  );
}
