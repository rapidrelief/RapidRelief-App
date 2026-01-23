import SettingsScreen from "@/app/screens/main/settings/SettingScreen";

export default function Page() {
  // We remove onNavigate because the Sidebar handles navigation now
  return <SettingsScreen />;
}