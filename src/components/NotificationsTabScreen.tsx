import React, { Dispatch, SetStateAction } from 'react'
import TabButtons, { TabButtonType } from './TabButtons'

export enum NotificationTab {
  Notifications,
  Messages,
}

type NotificationsTabScreenProps = {
  selectedTab: NotificationTab
  setSelectedTab: Dispatch<SetStateAction<NotificationTab>>
  messagesCount: number
}

const NotificationsTabScreen = ({
  selectedTab,
  setSelectedTab,
  messagesCount,
}: NotificationsTabScreenProps) => {
  const tabs: TabButtonType[] = [
    { title: 'Notifications' },
    { title: `Messages (${messagesCount})` },
  ]

  return (
    <TabButtons
      buttons={tabs}
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
    />
  )
}

export default NotificationsTabScreen