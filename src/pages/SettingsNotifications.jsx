import SubPage from '../components/SubPage'
import Card from '../components/ui/Card'
import PushSettings from '../components/PushSettings'

export default function SettingsNotifications() {
  return (
    <SubPage title="Benachrichtigungen">
      <Card className="!p-4">
        <PushSettings />
      </Card>
    </SubPage>
  )
}
