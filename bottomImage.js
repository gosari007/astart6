// 하단 이미지 관련 함수
let currentBottomMediaIndex = 0; // 현재 표시 중인 미디어 인덱스 (0부터 시작)
let bottomMediaTimer = null; // 자동 전환용 타이머
let isBottomMediaPlaying = true; // 하단 미디어 재생 상태
let bottomMediaFiles = []; // 정렬된 미디어 파일 목록을 저장할 배열

// 초기화: DOM이 로드되면 하단 미디어 표시 시작
document.addEventListener('DOMContentLoaded', function() {
  console.log("하단 미디어 스크립트 초기화");
  
  // 하단 미디어 파일 목록 초기화
  initBottomMediaFiles().then(() => {
    console.log("하단 미디어 파일 목록 초기화 완료:", bottomMediaFiles);
    
    // 하단 이미지/동영상 숨김 상태로 초기화
    hideBottomImage();
    
    // 시작 버튼 클릭 시 하단 미디어 표시 시작
    document.getElementById('startBtn').addEventListener('click', function() {
      startBottomMediaShow(); // 시작 버튼에서 하단 미디어 시작
    });
    
    // 정지 버튼 클릭 시 하단 미디어 정지
    document.getElementById('stopBtn').addEventListener('click', function() {
      stopBottomMediaShow();
    });
    
    // 일시 정지 버튼 클릭 시 하단 미디어 일시 정지/재개
    document.getElementById('pauseBtn').addEventListener('click', function() {
      toggleBottomMediaPause();
    });
    
    // 디버그용: 게임 캔버스 더블클릭 시 다음 미디어로 이동
    document.getElementById('gameCanvas').addEventListener('dblclick', function() {
      if (isBottomMediaPlaying) {
        moveToNextMedia();
      }
    });
  });
});

// 하단 미디어 파일 목록 초기화 (번호 순으로 정렬)
async function initBottomMediaFiles() {
  console.log("하단 미디어 파일 목록 가져오기 시작");
  bottomMediaFiles = [];
  
  // 파일 번호 1부터 시작해서 연속된 번호의 이미지/비디오 파일 확인
  let fileNumber = 1;
  let continueChecking = true;
  
  while (continueChecking) {
    // 이미지 파일(.jpg) 확인
    let imageExists = await checkFileExists(`images/bottom/${fileNumber}.jpg`);
    if (imageExists) {
      bottomMediaFiles.push({
        number: fileNumber,
        type: 'image',
        path: `images/bottom/${fileNumber}.jpg`
      });
      fileNumber++;
      continue;
    }
    
    // 비디오 파일(.mp4) 확인
    let videoExists = await checkFileExists(`images/bottom/${fileNumber}.mp4`);
    if (videoExists) {
      bottomMediaFiles.push({
        number: fileNumber,
        type: 'video',
        path: `images/bottom/${fileNumber}.mp4`
      });
      fileNumber++;
      continue;
    }
    
    // 더 이상 연속된 번호의 파일이 없으면 종료
    continueChecking = false;
  }
  
  // 번호 순으로 정렬
  bottomMediaFiles.sort((a, b) => a.number - b.number);
  
  console.log(`하단 미디어 파일 ${bottomMediaFiles.length}개 발견:`, bottomMediaFiles.map(file => file.path));
  return bottomMediaFiles;
}

// 미디어 목록 새로고침 (파일 추가/제거 확인)
async function refreshMediaFiles() {
  const oldCount = bottomMediaFiles.length;
  await initBottomMediaFiles();
  
  if (bottomMediaFiles.length !== oldCount) {
    console.log(`미디어 파일 목록 변경 감지: ${oldCount} -> ${bottomMediaFiles.length}`);
  }
  
  // 현재 인덱스가 범위를 벗어나면 처음으로 돌아감
  if (currentBottomMediaIndex >= bottomMediaFiles.length) {
    currentBottomMediaIndex = 0;
  }
}

// 하단 미디어 자동 표시 시작
function startBottomMediaShow() {
  console.log("하단 미디어 표시 시작 함수 호출");
  
  // 미디어 파일 목록 갱신
  refreshMediaFiles().then(() => {
    // 재생 중이 아닐 때만 시작
    isBottomMediaPlaying = true;
    
    // 이미 실행 중인 타이머가 있다면 제거
    if (bottomMediaTimer) {
      clearInterval(bottomMediaTimer);
      bottomMediaTimer = null;
    }
    
    // 하단 미디어 컨테이너 즉시 표시 준비
    const bottomImageContainer = document.getElementById('bottomImageContainer');
    if (bottomImageContainer) {
      bottomImageContainer.style.display = 'block';
      
      // 이전 애니메이션 완료 타이머 취소
      if (window.bottomHideTimer) {
        clearTimeout(window.bottomHideTimer);
      }
    }
    
    // 미디어 파일이 있는지 확인
    if (bottomMediaFiles.length > 0) {
      // 인덱스 초기화 (항상 첫 번째부터 시작)
      currentBottomMediaIndex = 0;
      
      // 즉시 현재 미디어 표시 시작
      showCurrentBottomMedia();
      
      // 이미지의 경우 10초마다, 비디오의 경우 비디오 종료 후 자동으로 다음으로 넘어감
      // 이미지일 경우를 위한 타이머 설정
      startImageTimer();
    } else {
      console.log("표시할 하단 미디어 파일이 없습니다.");
    }
  });
}

// 현재 보여지는 미디어가 이미지인 경우 타이머 시작
function startImageTimer() {
  // 기존 타이머 정리
  if (bottomMediaTimer) {
    clearTimeout(bottomMediaTimer);
    bottomMediaTimer = null;
  }
  
  // 현재 미디어가 이미지인 경우에만 타이머 설정
  if (bottomMediaFiles[currentBottomMediaIndex] && 
      bottomMediaFiles[currentBottomMediaIndex].type === 'image') {
    bottomMediaTimer = setTimeout(() => {
      if (isBottomMediaPlaying) {
        moveToNextMedia();
      }
    }, 10000); // 이미지는 10초 동안 표시
  }
}

// 다음 미디어로 이동
function moveToNextMedia() {
  // 타이머 정리
  if (bottomMediaTimer) {
    clearTimeout(bottomMediaTimer);
    bottomMediaTimer = null;
  }
  
  // 다음 인덱스로 이동
  currentBottomMediaIndex++;
  
  // 마지막 미디어 이후에는 다시 처음으로 돌아감
  if (currentBottomMediaIndex >= bottomMediaFiles.length) {
    currentBottomMediaIndex = 0;
  }
  
  console.log(`다음 미디어로 이동: ${currentBottomMediaIndex} (${bottomMediaFiles.length}개 중)`);
  showCurrentBottomMedia();
}

// 하단 미디어 정지
function stopBottomMediaShow() {
  console.log("하단 미디어 정지");
  isBottomMediaPlaying = false;
  
  // 타이머 제거
  if (bottomMediaTimer) {
    clearTimeout(bottomMediaTimer);
    bottomMediaTimer = null;
  }
  
  // 미디어 숨김
  hideBottomImage();
  
  // 인덱스 초기화
  currentBottomMediaIndex = 0;
}

// 하단 미디어 일시 정지/재개 토글
function toggleBottomMediaPause() {
  isBottomMediaPlaying = !isBottomMediaPlaying;
  console.log("하단 미디어 상태 변경:", isBottomMediaPlaying ? "재생" : "일시정지");
  
  // 현재 비디오가 표시 중이면 재생/일시 정지 토글
  const bottomVideo = document.getElementById('bottomVideo');
  if (bottomVideo && bottomVideo.style.display !== 'none') {
    if (isBottomMediaPlaying) {
      bottomVideo.play().catch(e => console.log('하단 비디오 재생 오류:', e));
    } else {
      bottomVideo.pause();
    }
  }
  
  // 재생 상태가 되면 타이머 다시 시작 (이미지일 경우)
  if (isBottomMediaPlaying) {
    startImageTimer();
  } else {
    // 일시정지면 타이머 중지
    if (bottomMediaTimer) {
      clearTimeout(bottomMediaTimer);
      bottomMediaTimer = null;
    }
  }
}

// 현재 인덱스의 미디어 표시
function showCurrentBottomMedia() {
  if (!isBottomMediaPlaying || bottomMediaFiles.length === 0) return;
  
  // 미디어 파일 정보 가져오기
  const mediaFile = bottomMediaFiles[currentBottomMediaIndex];
  if (!mediaFile) {
    console.error("현재 인덱스에 해당하는 미디어 파일이 없습니다:", currentBottomMediaIndex);
    return;
  }
  
  console.log(`미디어 표시 (${currentBottomMediaIndex + 1}/${bottomMediaFiles.length}): ${mediaFile.type} - ${mediaFile.path}`);
  
  // 타입에 따라 다른 함수 호출
  if (mediaFile.type === 'image') {
    showBottomImageContent(mediaFile.number);
    // 이미지는 자동 타이머 설정
    startImageTimer();
  } else if (mediaFile.type === 'video') {
    showBottomVideoContent(mediaFile.number);
    // 비디오는 onended 이벤트에서 다음으로 넘어가므로 여기서는 타이머 설정 안 함
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
    if (window.bottomHideTimer) {
      clearTimeout(window.bottomHideTimer);
    }
    window.bottomHideTimer = setTimeout(() => {
      bottomImageContainer.style.display = 'none';
    }, 4000); // 4초 후 완전히 숨김
  }
}

// 이 함수는 이제 사용하지 않음 (showCurrentBottomMedia로 대체)
function showBottomMedia(index) {
  console.log("경고: 이전 버전의 showBottomMedia 함수가 호출됨. 대신 showCurrentBottomMedia를 사용하세요.");
  
  // 파일 목록 새로고침 후 현재 미디어 표시
  refreshMediaFiles().then(() => {
    // 특정 번호의 파일을 찾아 인덱스 설정
    const fileIndex = bottomMediaFiles.findIndex(file => file.number === index);
    
    if (fileIndex !== -1) {
      currentBottomMediaIndex = fileIndex;
    } else {
      console.log(`미디어 번호 ${index}를 찾을 수 없어 처음부터 시작합니다.`);
      currentBottomMediaIndex = 0;
    }
    
    showCurrentBottomMedia();
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
    
    // 컨테이너 확실히 표시
    bottomImageContainer.style.display = 'block';
    
    // 즉시 애니메이션 시작 (지연 없음)
    // 슬라이드 업 애니메이션: 컨테이너를 아래에서 위로 올림
    requestAnimationFrame(() => {
      bottomImageContainer.style.bottom = '-80px'; // -80px 위치로 이동
      // 이미지 불투명도 애니메이션
      bottomImage.classList.add('show');
    });
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
    bottomVideo.style.transition = 'opacity 4.0s cubic-bezier(0.16, 0.81, 0.32, 1)'; // 더 천천히(4.0초) 페이드인 되며 더 강화된 ease-out 효과
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
    // 컨테이너 확실히 표시
    bottomImageContainer.style.display = 'block';
    
    // 즉시 애니메이션 시작 (지연 없음)
    requestAnimationFrame(() => {
      // 슬라이드 업 애니메이션: 컨테이너를 아래에서 위로 올림
      bottomImageContainer.style.bottom = '-80px'; // -80px 위치로 이동 (CSS에서 설정한 기존값과 동일)
      
      // 비디오 불투명도 애니메이션
      bottomVideo.style.opacity = '1';
      
      // 재생 상태면 즉시 재생 시작
      if (isBottomMediaPlaying) {
        bottomVideo.play().catch(e => {
          console.log('하단 비디오 자동 재생 실패:', e);
          // 실패 시 재시도 (음소거 옵션으로)
          setTimeout(() => {
            bottomVideo.muted = true;
            bottomVideo.play().then(() => {
              bottomVideo.muted = false; // 재생 시작 후 음소거 해제
            }).catch(() => {});
          }, 10);
        });
      }
    });
  };
  
  // 비디오 오류 이벤트
  bottomVideo.onerror = function() {
    console.log(`하단 동영상 ${index}.mp4를 찾을 수 없습니다.`);
    bottomImageContainer.style.display = 'none';
  };
  
  // 비디오 종료 이벤트
  bottomVideo.onended = function() {
    // 비디오가 종료되면 다음 미디어로 자동 전환
    if (isBottomMediaPlaying) {
      moveToNextMedia();
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
    // 이전 타이머 정리
    if (window.bottomHideTimer) {
      clearTimeout(window.bottomHideTimer);
    }
    
    // 컨테이너 초기화하고 표시 상태로 준비
    bottomImageContainer.style.bottom = '-150vh'; // 화면 밖 위치로 초기화
    bottomImageContainer.style.display = 'block'; // 표시 상태로 유지
  }
}
