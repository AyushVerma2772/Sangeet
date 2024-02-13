let currentSong = new Audio();
let songs;
let currFolder;
let isNavOpen = false;
const songList = document.querySelector(".songs-list");
const playPauseBtn = document.getElementById("play-pause")
const currentSongName = document.querySelector(".playbar-song-name");
const seekBar = document.querySelector("#seek-bar");
const hamburger = document.querySelector(".hamburger");
const leftPart = document.querySelector(".left");
const previousBtn = document.getElementById("previous");
const nextBtn = document.getElementById("next");
const playlistCardContainer = document.querySelector(".card-container");



const getSongs = async (folder) => {
    currFolder = folder;
    const data = await fetch(`http://127.0.0.1:5500/songs/${folder}`);
    const response = await data.text();

    

    // console.log(response)

    const elementDiv = document.createElement("div");
    elementDiv.innerHTML = response;

    const list = elementDiv.getElementsByTagName("a");

    // console.log(list)

    songs = [];


    for (const ele of list) {
        if (ele.href.endsWith(".mp3")) {
            songs.push(ele.href);
        }
    }


    // display the element
    songList.innerHTML = "";
    for (const song of songs) {
        songList.innerHTML +=
            `<li class="song">
            <div class="song-card flex">
                <h3 class="song-name">${decodeURI(song.replace(`http://127.0.0.1:5500/songs/${currFolder}/`, ""))}</h3>
                <button class="song-play-btn"><i class="fa-solid fa-play"></i></button>
            </div>
        </li>`
    }


}


const playSong = (songName) => {
    seekBar.value = 0;
    currentSong.src = `songs/${currFolder}/` + songName;
    currentSong.play();
    currentSongName.innerHTML = decodeURI(songName);
    playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

}


const formatTime = (seconds) => {
    seconds = Math.floor(seconds);

    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


// display all folders
const displayFolder = async () => {
    const data = await fetch(`http://127.0.0.1:5500/songs/`);
    const response = await data.text();

    // console.log(response)

    const elementDiv = document.createElement("div");
    elementDiv.innerHTML = response;

    const list = elementDiv.getElementsByTagName("a");

    const folders = []


    for (const ele of list) {
        if (ele.href.includes("/songs/")) {
            let a = ele.href.split("/");
            folders.push(a[a.length - 1])
        }
    }



    for (let index = 0; index < folders.length; index++) {
        const folder = folders[index];
        const data = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
        const response = await data.json();

        playlistCardContainer.innerHTML += `
        <div data-playlist=${folder} class="playlist-card flex">
            <img src="https://m.media-amazon.com/images/I/51r29mfcz6L._SY445_SX342_.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>

            <div class="play flex">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round"></path>
                </svg>
            </div>
        </div>
        `

    }

    Array.from(document.getElementsByClassName("playlist-card")).forEach(ele => {
        ele.addEventListener("click", async e => {
            await getSongs(e.currentTarget.dataset.playlist)
        })
    })
}


async function main() {

    displayFolder();

    await getSongs("Hin");


    // set default
    currentSongName.innerText = decodeURI(songs[0].replace(`http://127.0.0.1:5500/songs/${currFolder}/`, ""))
    currentSong.src = songs[0];

    // Play songs on click
    Array.from(songList.children).forEach((ele) => {
        ele.addEventListener("click", () => playSong(ele.querySelector(".song-name").innerHTML))
    })


    // play pause button
    playPauseBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            currentSong.pause();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });


    // update time
    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".time").innerText = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        const playedPercentage = (currentSong.currentTime / currentSong.duration) * 100;

        // move seek-bar
        seekBar.value = playedPercentage;

    })


    // Add eventlistener to seek bar 
    seekBar.addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        seekBar.value = percent;
        currentSong.currentTime = (currentSong.duration * percent) / 100

    })


    // open nav
    hamburger.addEventListener("click", () => {
        if (!isNavOpen) {
            isNavOpen = true;
            leftPart.style.left = "0%";
        }

        else {
            isNavOpen = false;
            leftPart.style.left = "-100%"
        }
    })

    // previous and next
    previousBtn.addEventListener("click", () => {
        let songIndex = songs.indexOf(currentSong.src)

        if (songIndex - 1 >= 0) {
            playSong(songs[songIndex - 1].replace(`http://127.0.0.1:5500/songs/${currFolder}/`, ""))
        }

        else {
            playSong(songs[songs.length - 1].replace(`http://127.0.0.1:5500/songs/${currFolder}/`, ""))
        }

    })


    // next and next
    nextBtn.addEventListener("click", () => {
        let songIndex = songs.indexOf(currentSong.src);
        let nextIndex = (songIndex + 1) % songs.length
        playSong(songs[nextIndex].replace(`http://127.0.0.1:5500/songs/${currFolder}/`, ""));
    })


    // Adjust the volume
    document.getElementById("volume").addEventListener("change", e => {
        if (e.target.value == 0) {
            document.querySelector(".volume-icon").innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        }
        else {
            document.querySelector(".volume-icon").innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        }

        currentSong.volume = e.target.value / 100;
    })

    document.querySelector(".volume-icon").addEventListener("click", () => {
        console.log(currentSong.volume)

        if (currentSong.volume != 0) {
            currentSong.volume = 0;
            document.getElementById("volume").value = 0;
            document.querySelector(".volume-icon").innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        }

        else {
            currentSong.volume = 1;
            document.getElementById("volume").value = 100;
            document.querySelector(".volume-icon").innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        }
    })


    

}

main();