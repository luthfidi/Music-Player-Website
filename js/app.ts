interface Song {
    title: string;
    artist: string;
    src: string;
    cover: string;
}

class MusicPlayer {
    private audio: HTMLAudioElement;
    private playlist: Song[];
    private filteredPlaylist: Song[];
    private currentSongIndex: number;
    private isPlaying: boolean;
    private currentPage: number;
    private songsPerPage: number;

    constructor() {
        this.audio = new Audio();
        this.audio.volume = 0.5;
        this.playlist = [];
        this.filteredPlaylist = [];
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.currentPage = 1;
        this.songsPerPage = 4;
        this.initializeEventListeners();
    
        setTimeout(() => {
            if (this.playlist.length > 0) {
                this.currentSongIndex = 0;
                this.audio.src = this.playlist[this.currentSongIndex].src;
                this.audio.volume = 0.5;
                this.updatePlayerUI();
            }
        }, 100);
    }    

    private initializeEventListeners(): void {
        const playPauseBtn = document.getElementById('play-pause') as HTMLButtonElement;
        const prevBtn = document.getElementById('prev') as HTMLButtonElement;
        const nextBtn = document.getElementById('next') as HTMLButtonElement;
        const volumeSlider = document.getElementById('volume') as HTMLInputElement;
        const progressBar = document.querySelector('.progress-bar') as HTMLDivElement;
        const prevPageBtn = document.getElementById('prev-page') as HTMLButtonElement;
        const nextPageBtn = document.getElementById('next-page') as HTMLButtonElement;

        volumeSlider.value = '50';
        volumeSlider.addEventListener('input', (e) => this.setVolume(Number((e.target as HTMLInputElement).value)));
    
        playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        prevBtn.addEventListener('click', () => this.playPrevious());
        nextBtn.addEventListener('click', () => this.playNext());
        progressBar.addEventListener('click', (e) => this.seek(e));
    
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.playNext());
        
        prevPageBtn.addEventListener('click', () => this.changePage(-1));
        nextPageBtn.addEventListener('click', () => this.changePage(1));
    }    

    public addSong(song: Song): void {
        this.playlist.push(song);
        this.filteredPlaylist = [...this.playlist];  // Update filtered playlist
        this.updatePlaylistUI();
    }

    private updatePlaylistUI(): void {
        const playlistElement = document.getElementById('playlist-items') as HTMLUListElement;
        playlistElement.innerHTML = '';
        
        const startIndex = (this.currentPage - 1) * this.songsPerPage;
        const endIndex = startIndex + this.songsPerPage;
        const displayedSongs = this.filteredPlaylist.slice(startIndex, endIndex);
        
        displayedSongs.forEach((song, index) => {
            const li = document.createElement('li');
            li.textContent = `${song.title} - ${song.artist}`;
            li.addEventListener('click', () => this.playSong(this.playlist.indexOf(song)));  // Play from main playlist
            playlistElement.appendChild(li);
        });
        
        this.updatePaginationButtons();
    }

    private updatePaginationButtons(): void {
        const prevPageBtn = document.getElementById('prev-page') as HTMLButtonElement;
        const nextPageBtn = document.getElementById('next-page') as HTMLButtonElement;
        
        prevPageBtn.disabled = this.currentPage === 1;
        nextPageBtn.disabled = this.currentPage * this.songsPerPage >= this.filteredPlaylist.length;
    }

    private changePage(direction: number): void {
        this.currentPage += direction;
        this.updatePlaylistUI();
    }

    private playSong(index: number): void {
        if (index >= 0 && index < this.playlist.length) {
            this.currentSongIndex = index;
            const song = this.playlist[this.currentSongIndex];
            this.audio.src = song.src;
            this.audio.play();
            this.isPlaying = true;
            this.updatePlayerUI();
        }
    }

    private togglePlayPause(): void {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
        this.isPlaying = !this.isPlaying;
        this.updatePlayerUI();
    }

    private playPrevious(): void {
        this.currentSongIndex = (this.currentSongIndex - 1 + this.playlist.length) % this.playlist.length;
        this.playSong(this.currentSongIndex);
    }

    private playNext(): void {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.playlist.length;
        this.playSong(this.currentSongIndex);
    }

    private setVolume(volume: number): void {
        this.audio.volume = volume / 100;
    }

    private updateProgress(): void {
        const progressBar = document.getElementById('progress') as HTMLDivElement;
        const currentTimeElement = document.getElementById('current-time') as HTMLSpanElement;
        const durationElement = document.getElementById('duration') as HTMLSpanElement;

        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration;
        const progressPercentage = (currentTime / duration) * 100;

        progressBar.style.width = `${progressPercentage}%`;
        currentTimeElement.textContent = this.formatTime(currentTime);
        durationElement.textContent = this.formatTime(duration);
    }

    private seek(e: MouseEvent): void {
        const progressBar = e.currentTarget as HTMLDivElement;
        const clickPosition = e.offsetX;
        const progressBarWidth = progressBar.clientWidth;
        const seekTime = (clickPosition / progressBarWidth) * this.audio.duration;
        this.audio.currentTime = seekTime;
    }

    private formatTime(time: number): string {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    private updatePlayerUI(): void {
        const playPauseBtn = document.getElementById('play-pause') as HTMLButtonElement;
        const songTitleElement = document.getElementById('song-title') as HTMLHeadingElement;
        const artistElement = document.getElementById('artist') as HTMLParagraphElement;
        const albumArtElement = document.getElementById('album-art') as HTMLImageElement;

        const currentSong = this.playlist[this.currentSongIndex];
        playPauseBtn.innerHTML = this.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        songTitleElement.textContent = currentSong.title;
        artistElement.textContent = currentSong.artist;
        albumArtElement.src = currentSong.cover;
    }

    public searchSongs(query: string): void {
        if (query.trim() === '') {
            this.filteredPlaylist = [...this.playlist];  // Reset to full playlist if query is empty
        } else {
            this.filteredPlaylist = this.playlist.filter(song =>
                song.title.toLowerCase().includes(query.toLowerCase()) ||
                song.artist.toLowerCase().includes(query.toLowerCase())
            );
        }
        this.currentPage = 1;
        this.updatePlaylistUI();
    }
}

// Initialize the music player
const player = new MusicPlayer();

// Add some sample songs (replace with your actual song data)
player.addSong({
    title: "Die With A Smile",
    artist: "Lady Gaga, Bruno Mars",
    src: "assets/audio/song1.mp3",
    cover: "assets/images/cover1.jpg"
});

player.addSong({
    title: "Kata Mereka Ini Berlebihan",
    artist: "Bernadya",
    src: "assets/audio/song2.mp3",
    cover: "assets/images/cover2.jpg"
});

player.addSong({
    title: "BIRDS OF A FEATHER",
    artist: "Billie Eilish",
    src: "assets/audio/song3.mp3",
    cover: "assets/images/cover3.jpg"
});

player.addSong({
    title: "for lovers who hesitate",
    artist: "JANNABI",
    src: "assets/audio/song4.mp3",
    cover: "assets/images/cover4.jpeg"
});

player.addSong({
    title: "Letting Go",
    artist: "DAY6",
    src: "assets/audio/song5.mp3",
    cover: "assets/images/cover5.jpg"
});

player.addSong({
    title: "annie.",
    artist: "wave to earth",
    src: "assets/audio/song6.mp3",
    cover: "assets/images/cover6.jpeg"
});

player.addSong({
    title: "Tampar",
    artist: "Juicy Luicy",
    src: "assets/audio/song7.mp3",
    cover: "assets/images/cover7.jpeg"
});

player.addSong({
    title: "'Cause You Have To",
    artist: "LANY",
    src: "assets/audio/song8.mp3",
    cover: "assets/images/cover8.jpeg"
});

// Add more songs as needed...

// Add event listener for search input
const searchInput = document.getElementById('search') as HTMLInputElement;
searchInput.addEventListener('input', (e) => player.searchSongs((e.target as HTMLInputElement).value));