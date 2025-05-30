// Xử lý hiển thị thông báo khi nhận được
self.addEventListener('push', event => {
    const data = event.data.json();

    const options = {
        body: data.body + `, set id là: ${data.setId}`,
        icon: data.icon || '/icon.png',
        data: { url: `http://localhost:3000/user/set/detail/${data.setId}` } // lưu URL vào data
    };

    console.log(data);

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const urlToOpen = event.notification.data.url;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function(clientList) {
                // Kiểm tra tab nào đã mở sẵn URL chưa
                for (let i = 0; i < clientList.length; i++) {
                    let client = clientList[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Nếu chưa thì mở tab mới
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen);
                }
            })
    );

    // event.waitUntil(
    //     self.clients.openWindow("https://google.com")
    //         .then(client => console.log('Mở tab mới thành công:', client))
    //         .catch(err => console.error('Lỗi khi mở tab mới:', err))
    // )
});

self.addEventListener("notificationclose", function (event) {
    event.notification.close();
    console.log('user has clicked notification close');
});