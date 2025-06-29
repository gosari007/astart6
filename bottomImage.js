// 하단 이미지 관련 함수
let currentBottomMediaIndex = 1; // 현재 표시 중인 미디어 번호
let bottomMediaTimer = null; // 자동 전환용 타이머
let isBottomMediaPlaying = true; // 하단 미디어 재생 상태

// 초기화: DOM이 로드되면 하단 미디어 표시 시작
document.addEventListener('DOMContentLoaded', function() {
  // 하단 이미지/동영상 숨김 상태로 초기화
  hideBottomImage();
  
  // 시작 버튼 클릭 시 하단 미디어는 첫 번째 폭발에서 시작하므로 여기서는 시작하지 않음
  document.getElementById('startBtn').addEventListener('click', function() {
    // startBottomMediaShow(); // 이 줄을 주석 처리하여 시작 버튼에서는 하단 미디어를 시작하지 않음
  });
  
  // 정지 버튼 클릭 시 하단 미디어 정지
  document.getElementById('stopBtn').addEventListener('click', function() {
    stopBottomMediaShow();
  });
  
  // 일시 정지 버튼 클릭 시 하단 미디어 일시 정지/재개
  document.getElementById('pauseBtn').addEventListener('click', function() {
    toggleBottomMediaPause();
  });
});

// 하단 미디어 자동 표시 시작
function startBottomMediaShow() {
  isBottomMediaPlaying = true;
  
  // 이미 실행 중인 타이머가 있다면 제거
  if (bottomMediaTimer) {
    clearInterval(bottomMediaTimer);
  }
  
  // 시작할 때 현재 미디어 표시
  showBottomMedia(currentBottomMediaIndex);
  
  // 10초마다 다음 미디어로 전환
  bottomMediaTimer = setInterval(() => {
    if (isBottomMediaPlaying) {
      currentBottomMediaIndex++;
      showBottomMedia(currentBottomMediaIndex);
    }
  }, 10000); // 10초 간격
}

// 하단 미디어 정지
function stopBottomMediaShow() {
  isBottomMediaPlaying = false;
  
  // 타이머 제거
  if (bottomMediaTimer) {
    clearInterval(bottomMediaTimer);
    bottomMediaTimer = null;
  }
  
  // 미디어 숨김
  hideBottomImage();
  
  // 인덱스 초기화
  currentBottomMediaIndex = 1;
}

// 하단 미디어 일시 정지/재개 토글
function toggleBottomMediaPause() {
  isBottomMediaPlaying = !isBottomMediaPlaying;
  
  // 재생 중이면 동영상 재생/일시 정지 토글
  const bottomVideo = document.getElementById('bottomVideo');
  if (bottomVideo) {
    if (isBottomMediaPlaying) {
      bottomVideo.play().catch(e => console.log('하단 비디오 재생 오류:', e));
    } else {
      bottomVideo.pause();
    }
  }
}

// 하단 미디어 숨김
function hideBottomImage() {
  const bottomImageContainer = document.getElementById('bottomImageContainer');
  const bottomImage = document.getElementById('bottomImage');
  const bottomVideo = document.getElementById('bottomVideo');
  
  if (bottomImageContainer) {
    // 이미지 애니메이션 클래스 제거
    if (bottomImage) {
      bottomImage.classList.remove('show');
    }
    
    // 비디오 애니메이션 효과 제거
    if (bottomVideo) {
      bottomVideo.style.opacity = '0';
      bottomVideo.pause();
    }
    
    // 컨테이너를 아래로 슬라이드하여 숨김
    bottomImageContainer.style.bottom = '-150vh';
    
    // 애니메이션 완료 후 컨테이너 숨기기
    setTimeout(() => {
      bottomImageContainer.style.display = 'none';
    }, 3000); // 3초 후 완전히 숨김
  }
}

// 하단 미디어 표시
function showBottomMedia(index) {
  const bottomImageContainer = document.getElementById('bottomImageContainer');
  const bottomImage = document.getElementById('bottomImage');
  
  if (!bottomImageContainer) return;
  
  console.log(`하단 미디어 표시 시도: ${index}`);
  
  // 이미지와 동영상 요소를 모두 초기화
  resetBottomMediaElements();

  // 먼저 bottom 폴더 내에서 MP4 파일 확인
  checkFileExists(`images/bottom/${index}.mp4`)
    .then(exists => {
      if (exists) {
        // MP4 파일이 존재하면 비디오 요소 사용
        console.log(`하단 폴더에서 동영상 찾음: ${index}.mp4`);
        showBottomVideoContent(index);
      } else {
        // MP4 파일이 없으면 이미지 파일(jpg) 확인
        checkFileExists(`images/bottom/${index}.jpg`)
          .then(imageExists => {
            if (imageExists) {
              // JPG 파일이 존재하면 이미지 요소 사용
              console.log(`하단 폴더에서 이미지 찾음: ${index}.jpg`);
              showBottomImageContent(index);
            } else {
              // 어떤 파일도 존재하지 않으면 인덱스 초기화하고 다시 시도
              console.log(`하단 미디어 파일을 찾을 수 없습니다: ${index}, 인덱스를 1로 재설정합니다.`);
              currentBottomMediaIndex = 1;
              // 재귀적으로 다시 시도 (1번부터)
              showBottomMedia(currentBottomMediaIndex);
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

// 하단 이미지 콘텐츠 표시
function showBottomImageContent(index) {
  const bottomImageContainer = document.getElementById('bottomImageContainer');
  const bottomImage = document.getElementById('bottomImage');
  
  if (!bottomImage || !bottomImageContainer) return;
  
  // 비디오 숨기고 이미지 표시
  if (document.getElementById('bottomVideo')) {
    document.getElementById('bottomVideo').style.display = 'none';
  }
  bottomImage.style.display = 'block';
  
  // 기존 애니메이션 클래스 제거
  bottomImage.classList.remove('show');
  
  // 이미지 경로 설정
  bottomImage.src = `images/bottom/${index}.jpg`;
  
  // 이미지 로드 이벤트
  bottomImage.onload = function() {
    // 추가적인 스타일 적용
    bottomImage.style.border = 'none';
    bottomImage.style.outline = 'none';
    bottomImage.style.objectFit = 'cover';
    bottomImage.style.objectPosition = 'center -50px'; // 윗부분 50px 크롭
    
    // 컨테이너 표시하기
    bottomImageContainer.style.display = 'block';
    
    // 약간의 지연 후 애니메이션 시작
    setTimeout(() => {
      // 슬라이드 업 애니메이션: 컨테이너를 아래에서 위로 올림
      bottomImageContainer.style.bottom = '-80px'; // -80px 위치로 이동
      
      // 이미지 불투명도 애니메이션
      bottomImage.classList.add('show');
    }, 50);
  };
  
  bottomImage.onerror = function() {
    // 이미지가 없으면 컨테이너를 숨김
    console.log(`하단 이미지 ${index}.jpg를 찾을 수 없습니다.`);
    bottomImageContainer.style.display = 'none';
  };
}

// 하단 동영상 콘텐츠 표시
function showBottomVideoContent(index) {
  const bottomImageContainer = document.getElementById('bottomImageContainer');
  let bottomVideo = document.getElementById('bottomVideo');
  
  // 비디오 요소가 없으면 생성
  if (!bottomVideo) {
    bottomVideo = document.createElement('video');
    bottomVideo.id = 'bottomVideo';
    bottomVideo.className = 'no-border-at-all video-touchable';
    bottomVideo.controls = true; // 컨트롤러 표시
    bottomVideo.autoplay = false; // 자동 재생 비활성화
    bottomVideo.muted = false; // 소리 활성화
    bottomVideo.playsInline = true; // 인라인 재생 (전체화면 방지)
    bottomVideo.setAttribute('playsinline', 'true'); // 표준 속성
    bottomVideo.setAttribute('webkit-playsinline', 'true'); // iOS Safari 호환성
    bottomVideo.setAttribute('x-webkit-airplay', 'allow'); // AirPlay 허용
    bottomVideo.setAttribute('data-tap-disabled', 'false'); // 탭 활성화
    // 모든 컨트롤 기능 활성화
    bottomVideo.controlsList = ""; // 모든 컨트롤 허용
    bottomVideo.disablePictureInPicture = false; // PiP 모드 활성화
    bottomVideo.preload = "auto"; // 데이터 미리 로드
    
    // 터치 이벤트 최적화 (모바일)
    bottomVideo.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';
    bottomVideo.style.webkitTouchCallout = 'none';
    bottomVideo.style.maxWidth = '100.24vw';
    bottomVideo.style.maxHeight = '50.13vh';
    bottomVideo.style.objectFit = 'cover';
    bottomVideo.style.objectPosition = 'center -50px'; // 윗부분 50px 크롭
    
    // 중앙 플레이 버튼이 표시되지 않도록 설정
    bottomVideo.setAttribute('disableRemotePlayback', ''); // 원격 재생 버튼 비활성화
    bottomVideo.classList.add('hide-center-play-button'); // 중앙 플레이버튼 숨기는 클래스 추가
    bottomVideo.style.border = '0 none transparent';
    bottomVideo.style.outline = '0 none transparent';
    bottomVideo.style.borderRadius = '0';
    bottomVideo.style.boxShadow = 'none';
    bottomVideo.style.backgroundColor = 'transparent';
    bottomVideo.style.opacity = '0';
    bottomVideo.style.transition = 'opacity 3s cubic-bezier(0.16, 0.81, 0.32, 1)'; // 더 천천히(3초) 페이드인 되며 더 강화된 ease-out 효과
    bottomImageContainer.appendChild(bottomVideo);
  }
  
  // 이미지 숨기고 비디오 표시
  if (document.getElementById('bottomImage')) {
    document.getElementById('bottomImage').style.display = 'none';
  }
  bottomVideo.style.display = 'block';
  
  // 비디오 소스 설정
  bottomVideo.src = `images/bottom/${index}.mp4`;
  bottomVideo.autoplay = isBottomMediaPlaying; // 재생 상태에 따라 자동 재생 설정
  bottomVideo.muted = false; // 음소거 해제
  
  // 비디오 클릭 이벤트 핸들러
  function handleBottomVideoInteraction(event) {
    // 이벤트 버블링 및 기본 동작 중지
    event.stopPropagation();
    event.preventDefault();
    
    console.log('하단 비디오 클릭/터치');
    toggleBottomVideoPlayback(bottomVideo);
    
    // 300ms 이내에 다시 클릭되지 않도록 이벤트 비활성화 후 재활성화
    bottomVideo.removeEventListener('click', handleBottomVideoInteraction);
    bottomVideo.removeEventListener('touchstart', handleBottomVideoInteraction);
    
    setTimeout(() => {
      bottomVideo.addEventListener('click', handleBottomVideoInteraction, {passive: false});
      bottomVideo.addEventListener('touchstart', handleBottomVideoInteraction, {passive: false});
    }, 300);
  }
  
  // 재생/일시정지 토글 함수
  function toggleBottomVideoPlayback(video) {
    if (video.paused) {
      video.play().catch(error => {
        console.log('하단 비디오 재생 실패:', error);
        
        // 재시도
        setTimeout(() => {
          video.muted = true; // 음소거 상태에서 시도
          video.play().then(() => {
            video.muted = false; // 음소거 해제
          }).catch(e => console.log('하단 비디오 재시도 실패:', e));
        }, 100);
      });
    } else {
      video.pause();
    }
  }
  
  // 이벤트 리스너 등록
  bottomVideo.addEventListener('click', handleBottomVideoInteraction, {passive: false});
  bottomVideo.addEventListener('touchstart', handleBottomVideoInteraction, {passive: false});
  
  // 비디오 로드 이벤트
  bottomVideo.onloadeddata = function() {
    bottomImageContainer.style.display = 'block';
    
    // 애니메이션 시작
    setTimeout(() => {
      // 슬라이드 업 애니메이션: 컨테이너를 아래에서 위로 올림
      bottomImageContainer.style.bottom = '-80px'; // -80px 위치로 이동 (CSS에서 설정한 기존값과 동일)
      
      // 비디오 불투명도 애니메이션
      bottomVideo.style.opacity = '1';
      
      // 재생 상태면 재생 시작
      if (isBottomMediaPlaying) {
        bottomVideo.play().catch(e => console.log('하단 비디오 자동 재생 실패:', e));
      }
    }, 50);
  };
  
  // 비디오 오류 이벤트
  bottomVideo.onerror = function() {
    console.log(`하단 동영상 ${index}.mp4를 찾을 수 없습니다.`);
    bottomImageContainer.style.display = 'none';
  };
  
  // 비디오 종료 이벤트
  bottomVideo.onended = function() {
    // 비디오가 종료되면 다음 미디어로 자동 전환 (타이머와 별개로)
    if (isBottomMediaPlaying) {
      currentBottomMediaIndex++;
      showBottomMedia(currentBottomMediaIndex);
    }
  };
}

// 모든 하단 미디어 요소 초기화
function resetBottomMediaElements() {
  const bottomImage = document.getElementById('bottomImage');
  const bottomVideo = document.getElementById('bottomVideo');
  const bottomImageContainer = document.getElementById('bottomImageContainer');
  
  if (bottomImage) {
    bottomImage.classList.remove('show');
    bottomImage.src = '';
  }
  
  if (bottomVideo) {
    bottomVideo.style.opacity = '0';
    bottomVideo.pause();
    bottomVideo.src = '';
  }
  
  // 컨테이너 위치 초기화 (화면 밖으로)
  if (bottomImageContainer) {
    bottomImageContainer.style.bottom = '-150vh';
  }
}
