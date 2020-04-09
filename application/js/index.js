$(function () {
    var Flag_repeat = false,
        Flag_cursor = false, //add by Zander
        playerTrack = $("#player-track"),
        albumName = $('#album-name'),
        trackName = $('#track-name'),
        albumArt = $('#album-art'),
        sArea = $('#s-area'),
        seekBar = $('#seek-bar'),
        trackTime = $('#track-time'),
        insTime = $('#ins-time'),
        sHover = $('#s-hover'),
        playPauseButton = $("#play-pause-button"),
        i = playPauseButton.find('i'),
        tProgress = $('#current-time'),
        tTime = $('#track-length'),
        seekT, seekLoc, seekBarPos, cM, ctMinutes, ctSeconds, curMinutes, curSeconds, durMinutes, durSeconds, playProgress, bTime, nTime = 0,
        buffInterval = null,
        ttemp = false,
        albums = ['Dawn', 'Me & You', 'Electro Boy', 'Home', 'Proxy (Original Mix)'],
        trackNames = ['Skylike - Dawn', 'Alex Skrindo - Me & You', 'Kaaze - Electro Boy', 'Jordan Schor - Home', 'Martin Garrix - Proxy'],
        albumArtworks = ['_1', '_2', '_3', '_4', '_5'],
        trackUrl = ['images/2.mp3', 'images/1.mp3', 'images/3.mp3', 'images/4.mp3', 'images/5.mp3'],
        playLoopTrackButton = $('#play-previous'),
        playNextTrackButton = $('#play-next'),
        currIndex = -1;

    function playPause() {
        setTimeout(function () {
            if (audio.paused) {
                playerTrack.addClass('active');
                albumArt.addClass('active');
                checkBuffering();
                i.attr('class', 'fas fa-pause');
                audio.play();
            } else {
                playerTrack.removeClass('active');
                albumArt.removeClass('active');
                clearInterval(buffInterval);
                albumArt.removeClass('buffering');
                i.attr('class', 'fas fa-play');
                audio.pause();
            }
        }, 300);
    }


    function showHover(event) {
        seekBarPos = sArea.offset();
        seekT = event.clientX - seekBarPos.left;
        seekLoc = audio.duration * (seekT / sArea.outerWidth());

        sHover.width(seekT);

        cM = seekLoc / 60;

        ctMinutes = Math.floor(cM);
        ctSeconds = Math.floor(seekLoc - ctMinutes * 60);

        if ((ctMinutes < 0) || (ctSeconds < 0))
            return;

        if ((ctMinutes < 0) || (ctSeconds < 0))
            return;

        if (ctMinutes < 10)
            ctMinutes = '0' + ctMinutes;
        if (ctSeconds < 10)
            ctSeconds = '0' + ctSeconds;

        if (isNaN(ctMinutes) || isNaN(ctSeconds))
            insTime.text('--:--');
        else
            insTime.text(ctMinutes + ':' + ctSeconds);

        insTime.css({
            'left': seekT,
            'margin-left': '-21px'
        }).fadeIn(0);

    }

    function hideHover() {
        sHover.width(0);
        insTime.text('00:00').css({
            'left': '0px',
            'margin-left': '0px'
        }).fadeOut(0);
    }

    function playFromClickedPos() {
        audio.currentTime = seekLoc;
        seekBar.width(seekT);
        hideHover();
    }

    function updateCurrTime() {
        nTime = new Date();
        nTime = nTime.getTime();

        if (!ttemp) {
            ttemp = true;
            trackTime.addClass('active');
        }

        curMinutes = Math.floor(audio.currentTime / 60);
        curSeconds = Math.floor(audio.currentTime - curMinutes * 60);

        durMinutes = Math.floor(audio.duration / 60);
        durSeconds = Math.floor(audio.duration - durMinutes * 60);

        playProgress = (audio.currentTime / audio.duration) * 100;

        if (curMinutes < 10)
            curMinutes = '0' + curMinutes;
        if (curSeconds < 10)
            curSeconds = '0' + curSeconds;

        if (durMinutes < 10)
            durMinutes = '0' + durMinutes;
        if (durSeconds < 10)
            durSeconds = '0' + durSeconds;

        if (isNaN(curMinutes) || isNaN(curSeconds))
            tProgress.text('00:00');
        else
            tProgress.text(curMinutes + ':' + curSeconds);

        if (isNaN(durMinutes) || isNaN(durSeconds))
            tTime.text('00:00');
        else
            tTime.text(durMinutes + ':' + durSeconds);

        if (isNaN(curMinutes) || isNaN(curSeconds) || isNaN(durMinutes) || isNaN(durSeconds))
            trackTime.removeClass('active');
        else
            trackTime.addClass('active');

        seekBar.width(playProgress + '%');

        if (playProgress == 100) { //播放完毕
            if (Flag_repeat == false) selectTrack2(1); //修改为自动下一首
            else audio.play(); //重复播放
        }

    }

    function checkBuffering() {
        clearInterval(buffInterval);
        buffInterval = setInterval(function () {
            if ((nTime == 0) || (bTime - nTime) > 1000)
                albumArt.addClass('buffering');
            else
                albumArt.removeClass('buffering');

            bTime = new Date();
            bTime = bTime.getTime();

        }, 100);
    }

    function selectTrack2(temp) {
        /*
         * 歌单详细见
         * https://api.uomg.com/doc-rand.music.html
         */
        $.getJSON('https://api.uomg.com/api/rand.music?', {
            mid: '564535179',
            format: 'json'
        }, function (json, textStatus) {
            if (json.code == 1) {
                if (temp == 0)
                    i.attr('class', 'fa fa-play');
                else {
                    albumArt.removeClass('buffering');
                    i.attr('class', 'fa fa-pause');
                }

                seekBar.width(0);
                trackTime.removeClass('active');
                tProgress.text('00:00');
                tTime.text('00:00');

                currAlbum = json.data.artistsname;
                currTrackName = json.data.name;
                currArtwork = json.data.picurl;

                audio.src = json.data.url;

                nTime = 0;
                bTime = new Date();
                bTime = bTime.getTime();

                if (temp == 1) {
                    audio.play();
                    playerTrack.addClass('active');
                    albumArt.addClass('active');

                    clearInterval(buffInterval);
                    checkBuffering();
                }

                albumName.text(currAlbum);
                trackName.text(currTrackName);
                albumArt.find('img.active').removeClass('active');
                $('#album-pic').addClass('active');

                $('#album-pic').attr('src', currArtwork);
            }

        });
    }

    function initPlayer() {

        audio = new Audio();

        selectTrack2(0);

        audio.loop = false;

        playPauseButton.on('click', playPause);

        sArea.mousemove(function (event) {
            showHover(event);
        });

        sArea.mouseout(hideHover);

        sArea.on('click', playFromClickedPos);

        $(audio).on('timeupdate', updateCurrTime);

        var here = document.getElementById('play-previous'); //点击效果
        here.onmouseover = function () {
            document.getElementById("repeat").src = "repeat0.png";
        }
        here.onmouseout = function () {
            if (!Flag_repeat) document.getElementById("repeat").src = "repeat1.png";
            else document.getElementById("repeat").src = "repeat2.png";
        }

        playLoopTrackButton.on('click', function () {
            Flag_repeat = !Flag_repeat; //修改标记

            if (Flag_repeat) { //修改图标
                document.getElementById("repeat").src = "repeat2.png";
            } else {
                document.getElementById("repeat").src = "repeat1.png";
            }

        });

        playNextTrackButton.on('click', function () {
            selectTrack2(1);
        });
    }

    function playLoop() {
        Flag_repeat = !Flag_repeat; //修改标记

        if (Flag_repeat) { //修改图标
            document.getElementById("repeat").src = "repeat2.png";
        } else {
            document.getElementById("repeat").src = "repeat1.png";
        }
    }

    function playNext() {
        selectTrack2(1);

        document.getElementById("next").src = "next2.png";
        setTimeout(function () {
            document.getElementById("next").src = "next1.png";
        }, 400);
    }

    initPlayer();

    const volume = navigator.volumeManager;

    function handleKeyDown(evt) {
        switch (evt.key) {
            case 'SoftLeft':
                playLoop();
                break;
            case 'SoftRight':
                playNext();
                break;
            case 'Enter':
                playPause();
                break;
            case 'ArrowLeft':
                audio.currentTime -= 5;
                break;
            case 'ArrowRight':
                audio.currentTime += 5;
                break;
            case 'ArrowUp':
                volume.requestUp();
                break;
            case 'ArrowDown':
                volume.requestDown();
                break;
            case '#':
                alert("By:此店不售此书");
                break;
        };
    };
    document.addEventListener('keydown', handleKeyDown);
});