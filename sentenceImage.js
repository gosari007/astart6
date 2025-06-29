// 문장 이미지 관련 함수
function showSentenceImage(sentenceIndex) {
  // 홀수 번호 문장(1, 3, 5...)인 경우에만 이미지 표시
  if (sentenceIndex % 2 === 0) { // 0부터 시작하는 인덱스에서는 짝수(0,2,4...)가 실제로는 홀수(1,3,5...)
    const realSentenceNumber = sentenceIndex + 1; // 1부터 시작하는 실제 문장 번호
    
    console.log(`상단 이미지 표시 시작 (홀수 문장): 문장 번호 ${realSentenceNumber}`);
    
    // 이전 이미지/동영상이 있다면 먼저 숨기기
    const sentenceImageContainer = document.getElementById('sentenceImageContainer');
    if (sentenceImageContainer && sentenceImageContainer.style.display === 'block') {
      hideSentenceImage();
      
      // 이미지/동영상이 완전히 사라진 후 새 이미지/동영상 표시
      setTimeout(() => {
        showNewSentenceMedia(realSentenceNumber);
      }, 1600); // 1.5초 사라짐 애니메이션 + 0.1초 여유
    } else {
      // 이전 이미지/동영상이 없다면 바로 새 이미지/동영상 표시
      showNewSentenceMedia(realSentenceNumber);
    }
  } else {
    console.log(`짝수 문장 폭발 - 상단 이미지 표시 안함: ${sentenceIndex + 1}`);
  }
}

function showNewSentenceMedia(realSentenceNumber) {
  const sentenceImageContainer = document.getElementById('sentenceImageContainer');
  const sentenceImage = document.getElementById('sentenceImage');
  
  if (!sentenceImageContainer) return;
  
  console.log(`상단 미디어 표시 시도: ${realSentenceNumber}`);
  
  // 이미지와 동영상 요소를 모두 초기화
  resetMediaElements();

  // 먼저 top 폴더 내 MP4 파일 확인
  checkFileExists(`images/top/${realSentenceNumber}.mp4`)
    .then(existsInTop => {
      if (existsInTop) {
        // top 폴더에 MP4 파일이 존재하면 비디오 요소 사용
        console.log(`top 폴더에서 동영상 찾음: ${realSentenceNumber}.mp4`);
        showVideoContent(realSentenceNumber, 'top');
      } else {
        // 루트 images 폴더에서 MP4 확인
        checkFileExists(`images/${realSentenceNumber}.mp4`)
          .then(existsInRoot => {
            if (existsInRoot) {
              // 루트 폴더에 MP4 파일이 존재하면 비디오 요소 사용
              console.log(`루트 폴더에서 동영상 찾음: ${realSentenceNumber}.mp4`);
              showVideoContent(realSentenceNumber);
            } else {
              // MP4가 없으면 이미지 파일(jpg) 확인
              checkFileExists(`images/top/${realSentenceNumber}.jpg`)
                .then(imageExistsInTop => {
                  if (imageExistsInTop) {
                    // top 폴더에 JPG 파일이 존재하면 이미지 요소 사용
                    console.log(`top 폴더에서 이미지 찾음: ${realSentenceNumber}.jpg`);
                    showImageContent(realSentenceNumber, 'top');
                  } else {
                    checkFileExists(`images/${realSentenceNumber}.jpg`)
                      .then(imageExistsInRoot => {
                        if (imageExistsInRoot) {
                          // 루트 폴더에 JPG 파일이 존재하면 이미지 요소 사용
                          console.log(`루트 폴더에서 이미지 찾음: ${realSentenceNumber}.jpg`);
                          showImageContent(realSentenceNumber);
                        } else {
                          // 어떤 파일도 존재하지 않으면 컨테이너 숨김
                          console.log(`미디어 파일(이미지/동영상)을 찾을 수 없습니다: ${realSentenceNumber}`);
                          sentenceImageContainer.style.display = 'none';
                        }
                      });
                  }
                });
            }
          });
      }
    });
}

// 파일 존재 여부 확인 (Head 요청으로 확인)
function checkFileExists(url) {
  return fetch(url, { method: 'HEAD' })
    .then(response => response.ok)
    .catch(() => false);
}

// 이미지 콘텐츠 표시
function showImageContent(realSentenceNumber, folder = '') {
  const sentenceImageContainer = document.getElementById('sentenceImageContainer');
  const sentenceImage = document.getElementById('sentenceImage');
  
  if (!sentenceImage || !sentenceImageContainer) return;
  
  // 비디오 숨기고 이미지 표시
  if (document.getElementById('sentenceVideo')) {
    document.getElementById('sentenceVideo').style.display = 'none';
  }
  sentenceImage.style.display = 'block';
  
  // 기존 애니메이션 클래스 제거
  sentenceImage.classList.remove('show');
  
  // 이미지 경로 설정 (폴더 경로 포함)
  let imagePath = '';
  if (folder) {
    imagePath = `images/${folder}/${realSentenceNumber}.jpg`;
  } else {
    imagePath = `images/${realSentenceNumber}.jpg`;
  }
  
  console.log(`상단 이미지 로딩 중: ${imagePath}`);
  sentenceImage.src = imagePath;
  
  // 이미지 로드 이벤트
  sentenceImage.onload = function() {
    console.log(`상단 이미지 로드 완료: ${imagePath}`);
    // 추가적인 스타일 적용으로 테두리 제거
    sentenceImage.style.border = 'none';
    sentenceImage.style.outline = 'none';
    sentenceImageContainer.style.display = 'block';
    
    // 약간의 지연 후 애니메이션 시작 (브라우저가 DOM 변경을 인식할 시간 제공)
    setTimeout(() => {
      sentenceImage.classList.add('show');
    }, 50);
  };
  
  sentenceImage.onerror = function() {
    // 이미지가 없으면 컨테이너를 숨김
    console.log(`상단 이미지 로드 실패: ${imagePath}`);
    sentenceImageContainer.style.display = 'none';
  };
}

// 동영상 콘텐츠 표시
function showVideoContent(realSentenceNumber, folder = '') {
  const sentenceImageContainer = document.getElementById('sentenceImageContainer');
  let sentenceVideo = document.getElementById('sentenceVideo');
  
  console.log(`상단 동영상 표시 함수 호출: ${realSentenceNumber}, 폴더: ${folder}`);
  
  // 비디오 요소가 없으면 생성
  if (!sentenceVideo) {
    console.log('상단 동영상 요소 생성');
    sentenceVideo = document.createElement('video');
    sentenceVideo.id = 'sentenceVideo';
    sentenceVideo.className = 'no-border-at-all video-touchable';
    sentenceVideo.controls = true; // 컨트롤러 표시
    sentenceVideo.autoplay = false; // 자동 재생 비활성화
    sentenceVideo.muted = false; // 소리 활성화
    sentenceVideo.playsInline = true; // 인라인 재생 (전체화면 방지)
    sentenceVideo.setAttribute('playsinline', 'true'); // 표준 속성
    sentenceVideo.setAttribute('webkit-playsinline', 'true'); // iOS Safari 호환성
    sentenceVideo.setAttribute('x-webkit-airplay', 'allow'); // AirPlay 허용
    sentenceVideo.setAttribute('data-tap-disabled', 'false'); // 탭 활성화
    // 컨트롤 기능 설정 - 플레이 버튼 표시, 시계 표시 제거
    sentenceVideo.controlsList = "nodownload"; // 다운로드 버튼 제거
    sentenceVideo.disablePictureInPicture = true; // PiP 모드 비활성화
    sentenceVideo.preload = "auto"; // 데이터 미리 로드
    
    // 터치 이벤트 최적화 (모바일)
    sentenceVideo.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';
    sentenceVideo.style.webkitTouchCallout = 'none';
    sentenceVideo.style.maxWidth = '100.24vw';
    sentenceVideo.style.maxHeight = '50.13vh';
    sentenceVideo.style.objectFit = 'cover';
    sentenceVideo.style.objectPosition = 'center -45px'; // 상단 45px 크롭하여 메뉴 아이콘이 가려지지 않도록 함
    
    // 컨트롤 설정 - 플레이 버튼을 시계 자리에 표시
    sentenceVideo.setAttribute('disableRemotePlayback', ''); // 원격 재생 버튼 비활성화
    // controlslist 속성 설정 (다운로드 버튼 제거, 플레이 버튼 유지)
    sentenceVideo.setAttribute('controlslist', 'nodownload'); // 다운로드 버튼 제거
    // 중앙 플레이 버튼은 필요하므로 제거하지 않음
    sentenceVideo.style.border = '0 none transparent';
    sentenceVideo.style.outline = '0 none transparent';
    sentenceVideo.style.borderRadius = '0';
    sentenceVideo.style.boxShadow = 'none';
    sentenceVideo.style.backgroundColor = 'transparent';
    sentenceVideo.style.transform = 'scale(0)';
    sentenceVideo.style.opacity = '0';
    sentenceVideo.style.transition = 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    sentenceImageContainer.appendChild(sentenceVideo);
  }
  
  // 이미지 숨기고 비디오 표시
  if (document.getElementById('sentenceImage')) {
    document.getElementById('sentenceImage').style.display = 'none';
  }
  sentenceVideo.style.display = 'block';
  
  // 비디오 소스 설정 (폴더 경로 포함)
  let videoPath = '';
  if (folder) {
    videoPath = `images/${folder}/${realSentenceNumber}.mp4`;
  } else {
    videoPath = `images/${realSentenceNumber}.mp4`;
  }
  
  // 컨테이너 표시 확실히 하기
  sentenceImageContainer.style.display = 'block';
  
  console.log(`상단 동영상 로딩 중: ${videoPath}`);
  sentenceVideo.src = videoPath;
  sentenceVideo.autoplay = false; // 자동 재생 비활성화
  sentenceVideo.muted = false; // 음소거 해제 (자동재생 방지)
  
  // 모든 이벤트 리스너 제거 및 다시 설정
  sentenceVideo.removeEventListener('click', window.videoClickHandler);
  sentenceVideo.removeEventListener('touchstart', window.videoTouchHandler);
  
  // 전역 스코프에 핸들러 저장하여 나중에 제거 가능하게 함
  window.videoClickHandler = function(event) {
    // 이벤트 버블링 및 기본 동작 중지
    event.stopPropagation();
    event.preventDefault();
    
    console.log('비디오 클릭 이벤트 발생');
    toggleVideoPlayback(sentenceVideo);
  };
  
  window.videoTouchHandler = function(event) {
    // 모바일에서 터치 이벤트 최적화
    event.stopPropagation();
    event.preventDefault();
    
    console.log('비디오 터치 이벤트 발생');
    toggleVideoPlayback(sentenceVideo);
    
    // 300ms 이내에 다시 터치되지 않도록 이벤트 비활성화 후 재활성화
    sentenceVideo.removeEventListener('touchstart', window.videoTouchHandler);
    setTimeout(() => {
      sentenceVideo.addEventListener('touchstart', window.videoTouchHandler);
    }, 300);
  };
  
  // 재생/일시정지 토글 함수
  function toggleVideoPlayback(video) {
    if (video.paused) {
      // 여러 방법으로 재생 시도
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('비디오 재생 성공');
        }).catch(error => {
          console.log('재생 시도 실패:', error);
          
          // 첫 번째 재시도
          setTimeout(() => {
            console.log('재생 재시도 1');
            video.muted = true; // 음소거 상태에서 시도
            video.play().then(() => {
              console.log('음소거 재생 성공');
              video.muted = false; // 음소거 해제
            }).catch(e => {
              console.log('음소거 재생 실패:', e);
              
              // 두 번째 재시도
              setTimeout(() => {
                console.log('재생 재시도 2');
                video.play().catch(e2 => console.log('최종 재시도 실패:', e2));
              }, 200);
            });
          }, 100);
        });
      }
    } else {
      video.pause();
      console.log('비디오 일시정지');
    }
  }
  
  // 다양한 방식의 이벤트 리스너 등록
  sentenceVideo.addEventListener('click', window.videoClickHandler, {passive: false});
  sentenceVideo.addEventListener('touchstart', window.videoTouchHandler, {passive: false});
  
  // 컨트롤러 요소 전용 이벤트 처리 (중첩 이벤트 처리 확실히)
  setTimeout(() => {
    try {
      const mediaControls = sentenceVideo.querySelector('::-webkit-media-controls-play-button');
      if (mediaControls) {
        mediaControls.addEventListener('click', function(e) {
          console.log('미디어 컨트롤 클릭');
          e.stopPropagation();
        }, {passive: false});
      }
    } catch (e) {
      console.log('미디어 컨트롤 접근 실패:', e);
    }
  }, 500);
  
  // 플레이어 상태 변화 감지
  sentenceVideo.addEventListener('play', function() {
    console.log('비디오 재생 시작됨');
  });
  
  sentenceVideo.addEventListener('pause', function() {
    console.log('비디오 일시정지됨');
  });
  
  // 비디오 로드 이벤트
  sentenceVideo.onloadeddata = function() {
    console.log(`상단 비디오 로드 완료: ${videoPath}`);
    // 컨테이너 표시
    sentenceImageContainer.style.display = 'block';
    
    // 약간의 지연 후 애니메이션 시작 (자동 재생 없음)
    setTimeout(() => {
      sentenceVideo.style.transform = 'scale(1)';
      sentenceVideo.style.opacity = '1';
      // 자동 재생하지 않음 - 사용자가 직접 플레이 버튼을 클릭해야 함
    }, 50);
  };
  
  sentenceVideo.onerror = function() {
    console.log(`동영상 ${realSentenceNumber}.mp4를 찾을 수 없습니다.`);
    sentenceImageContainer.style.display = 'none';
  };
}

// 모든 미디어 요소 초기화
function resetMediaElements() {
  const sentenceImage = document.getElementById('sentenceImage');
  const sentenceVideo = document.getElementById('sentenceVideo');
  
  if (sentenceImage) {
    sentenceImage.classList.remove('show');
    sentenceImage.src = '';
  }
  
  if (sentenceVideo) {
    sentenceVideo.style.transform = 'scale(0)';
    sentenceVideo.style.opacity = '0';
    sentenceVideo.pause();
    sentenceVideo.src = '';
  }
}

function hideSentenceImage() {
  const sentenceImageContainer = document.getElementById('sentenceImageContainer');
  const sentenceImage = document.getElementById('sentenceImage');
  const sentenceVideo = document.getElementById('sentenceVideo');
  
  if (sentenceImageContainer) {
    // 이미지 애니메이션 클래스 제거
    if (sentenceImage) {
      sentenceImage.classList.remove('show');
    }
    
    // 비디오 애니메이션 효과 제거
    if (sentenceVideo) {
      sentenceVideo.style.transform = 'scale(0)';
      sentenceVideo.style.opacity = '0';
      sentenceVideo.pause();
    }
    
    // 애니메이션 완료 후 컨테이너 숨기기
    setTimeout(() => {
      sentenceImageContainer.style.display = 'none';
    }, 1500); // 1.5초 후 완전히 숨김
  }
}

// 이미지/동영상 초기화
document.addEventListener('DOMContentLoaded', function() {
  hideSentenceImage();
  
  // 상단 이미지/동영상 컨테이너 위치 조정
  const sentenceImageContainer = document.getElementById('sentenceImageContainer');
  if (sentenceImageContainer) {
    sentenceImageContainer.style.top = '45px'; // 메뉴 아이콘이 가려지지 않도록 함 (55px에서 10px 올림)
    console.log('상단 이미지 컨테이너 위치 조정: 45px');
  }
});
