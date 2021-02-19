# getmusic

Archives given Youtube URL music into Google Storage.

## Modules

1. `gui` shows input for URL
2. `enquerer` receives URL and sends it to PubSub
3. `downloader` receives URL from PubSub and tries to download music and upload it to Storage
4. `reporter` receives URLs from PubSub dead letter queue, that couldn't be downloaded 
