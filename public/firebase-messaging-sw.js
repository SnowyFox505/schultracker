// Displays data-only pushes sent by api/cron-notify.js and api/send-test.js.
self.addEventListener('push', (event) => {
  const data = (event.data && event.data.json().data) || {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'Schultracker', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      data: { url: data.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) {
          c.navigate(url)
          return c.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})
