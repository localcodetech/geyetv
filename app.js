const channels = [
  { name: "G-Eye TV Live", stream: "https://online.geyetv.com/hls/stream.m3u8", image: "images/geyetv.png" },
  { name: "G-Eye 247 News", stream: "https://server.geyetv.com/G-Eye247News/index.m3u8", image: "images/G-Eye247News.png" },
  { name: "G-Eye Afro Cinema", stream: "https://server.geyetv.com/G-EyeAfroCinema/index.m3u8", image: "images/AFROCINEMA.png" },
  { name: "G-Eye Kids Zone", stream: "https://server.geyetv.com/G-EyeKidsZone/index.m3u8", image: "images/KIDSZONE.png" },
  { name: "G-Eye Music Plus", stream: "https://server.geyetv.com/G-EyeMusicplus/index.m3u8", image: "images/GeyeMusic+.png" },
  { name: "G-Eye Sports Network", stream: "https://server.geyetv.com/G-EyeSportsNetwork/index.m3u8", image: "images/SPORTSNETWORK.png" },
  { name: "G-Eye Action HD", stream: "https://server.geyetv.com/G-EyeActionHD/index.m3u8", image: "images/ACTIONHD.png" },
  { name: "G-Eye Mission", stream: "https://server.geyetv.com/G-EyeMission/index.m3u8", image: "images/MISSION.png" },
  { name: "G-Eye Docs", stream: "https://server.geyetv.com/G-EyeDocs/index.m3u8", image: "images/DOCS.png" },
  { name: "G-Eye Gospel Flow", stream: "https://server.geyetv.com/G-EyeGospelFlow/index.m3u8", image: "images/GOSPELFLOW.png" },
  { name: "G-Eye Prime Series", stream: "https://server.geyetv.com/G-EyePrimeSeries/index.m3u8", image: "images/PRIMESERIES.png" },
  { name: "G-Eye Extra", stream: "https://server.geyetv.com/g-eyetv-extra/index.m3u8", image: "images/Extra.png" },
  { name: "G-Eye Wild", stream: "https://server.geyetv.com/G-EyeWild/index.m3u8", image: "images/WILD.png" },
  { name: "G-Eye Cine Afrique", stream: "https://server.geyetv.com/geyecineafrique/index.m3u8", image: "images/GeyeCinemaAfrique.png" },
  { name: "G-Eye Cinema Prime", stream: "https://server.geyetv.com/geyecinemaprime/index.m3u8", image: "images/GeyeCinémaPrime.png" },
  { name: "Box Office", stream: "https://server.geyetv.com/boxoffice/index.m3u8", image: "images/BoxOffice.png" },
  { name: "Afro Fuse HD", stream: "https://server.geyetv.com/afrofusehd/index.m3u8", image: "images/afrofuse.png" },
  { name: "Weather 247", stream: "https://server.geyetv.com/Weather247/index.m3u8", image: "images/Weather247.png" },
  { name: "FIFA Plus", stream: "https://server.geyetv.com/fifaplus/index.m3u8", image: "images/fifaplus.png" },
  { name: "Docuseries Crimes", stream: "https://server.geyetv.com/docuseriescrimes/index.m3u8", image: "images/DocuSeriesCrime.png" },
  { name: "France 24", stream: "https://server.geyetv.com/france24/index.m3u8", image: "images/GeyeFrance.png" },
  { name: "Movie 247", stream: "https://server.geyetv.com/Movie247/index.m3u8", image: "images/movie247.png" },
  { name: "Euronews FR", stream: "https://server.geyetv.com/euronewsfr/index.m3u8", image: "images/FREuroNewsHD.png" },
  { name: "Cinebox Action", stream: "https://server.geyetv.com/Cinebox-action/index.m3u8", image: "images/cineboxaction.png" },
  { name: "Cinebox Animation", stream: "https://server.geyetv.com/cinebox-animation/index.m3u8", image: "images/CineBoxAnimation.png" },
  { name: "France 24 News", stream: "https://server.geyetv.com/francis24news/index.m3u8", image: "images/GeyeFrance.png" }
];

const grid = document.getElementById('vidlink');
const video = document.getElementById('mainPlayer');
const statusLabel = document.getElementById('statusLabel');
let hls;

function switchChannel(streamUrl, channelName) {
    // UI Update
    statusLabel.innerHTML = `<i class="fas fa-circle-play me-2"></i>Now Playing: ${channelName}`;

    // HLS Playback Logic
    if (hls) {
        hls.destroy(); // Clean up current stream before loading new one
    }

    if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            video.play();
        });
    } 
    // For Safari/iOS which supports HLS natively
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', function() {
            video.play();
        });
    }
}

function init() {
    channels.forEach(ch => {
        const li = document.createElement('li');
        li.className = 'channel-item';
        
        li.innerHTML = `
            <img src="${ch.image}" alt="${ch.name}" onerror="this.src='https://i.imgur.com/PRL4asG.jpeg'">
            <p>${ch.name}</p>
        `;

        // Pass ch.stream to the function
        li.onclick = () => switchChannel(ch.stream, ch.name);
        grid.appendChild(li);
    });

    // Autoplay the first channel
    if (channels.length > 0) {
        switchChannel(channels[0].stream, channels[0].name);
    }
}

document.addEventListener('DOMContentLoaded', init);