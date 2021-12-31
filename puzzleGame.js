// 마크업한 각 요소들을 가지고와 변수에 저장함
const imgContainer = document.querySelector(".img-container");
const startButton = document.querySelector(".start-btn");
const gameText = document.querySelector(".game-text");
const playTime = document.querySelector(".play-time");

// 타일의 전체 갯수
const tileCount = 16;
// 동적으로 만들어진 타일들을 담을 배열 생성
let tiles = [];

const dragged = {
  //각 li요소들의 정보(데이터)를 저장할 객체 생성
  //객체를 생성하는 이유: 여러 데이터들을 객체라는 가방안에 넣어서 이 객체 하나를 들고다니면서 핸들링 하면됨
  //각각의 회원정보들을 담을수있는 인스턴스라는 가방이자 공간을 만들어주는거지
  //회원이 여럿일때 A회원정보 -> (A회원인스턴스), B회원정보 -> (B회원인스턴스)
  //루프를 돌릴때마다 새로운 인스턴스가 만들어지고 거기에 각 회원 정보들이 저장이됨
  el: null, //요소
  class: null,
  index: null,
};
let isPlaying = false;
let timeInterval = null;

// functions

function checkStatus() {
  // 아이템을 드롭 할 때마다 아이템에 해당하는 인덱스와 각 li요소들이 갖는 data-index값을 비교하여 상태를 바꾸는 함수
  const currentList = [...imgContainer.children];
  const unMatchedList = currentList.filter(
    (child, index) => Number(child.getAttribute("data-index")) !== index
  );
  if (unMatchedList.length === 0) {
    // 퍼즐을 전부 맞췄으면
    gameText.style.display = "block";
    isPlaying = false;
    clearInterval(timeInterval);
  }
}

function setGame() {
  // 게임시작
  let time = 0;
  // 성공 여부를 저장할 변수
  isPlaying = true;
  imgContainer.innerHTML = "";
  gameText.style.display = "none";
  clearInterval(timeInterval);

  timeInterval = setInterval(() => {
    playTime.innerText = time;
    time++;
  }, 1000);

  tiles = createImageTiles();
  tiles.forEach((tile) => imgContainer.appendChild(tile));
  setTimeout(() => {
    imgContainer.innerHTML = "";
    shuffle(tiles).forEach((tile) => imgContainer.appendChild(tile));
  }, 2000);
}
// tile : 루프를 돌릴때 tiles에 저장된 원소 하나에 대하여 arrow함수를 호출하여
// tile이라는 변수에 저장함
// 4x4 사이즈 : 아이템(16칸)
// li을 무작위로 섞어주는 기능은 함수로 따로 만들어 구현

function createImageTiles() {
  const tempArray = [];
  Array(tileCount)
    .fill()
    .forEach((s, i) => {
      const li = document.createElement("li");
      //인덱스로 돌리면서 각 인덱스에 위치하는 li(칸)가 유저가 선택한 li인지
      //정확하게 정해져야 하므로 비교를 통해 지정함
      li.setAttribute("data-index", i);
      li.setAttribute("draggable", true);
      li.classList.add(`list${i}`);
      tempArray.push(li);
    });
  return tempArray;
}

function shuffle(arry) {
  // shuffle() : 카드(li)를 랜덤하게 배치하는 함수
  // 인자로 배열을 받아와서작업함
  let index = arry.length - 1;
  // index : 마지막 원소의 인덱스를 구하여 저장함
  // 루프 돌릴때 쓰려고 크기16이면 마지막 원소의 인덱스 15
  while (index > 0) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    //index만 곱하면 15미만의 난수 발생 거기에 +1 해줘야 16미만의 난수발생시킴
    //random(): 0보다 크고 1보다 작은 임의 실수값을 리턴해줌
    [arry[index], arry[randomIndex]] = [arry[randomIndex], arry[index]];
    index--;
  }
  return arry;
}

// 카드들(li 요소들)을 드래그 할 수 있는 기능(함수) 만들기
// 지금 프로그래밍은 함수형 프로그래밍에 가까움
// 각각의 기능들을 함수 단위로 쪼개어 마치 레고블록을 붙이듯이 작업하는형태

/* - 게임시작 기능 - 
퍼즐들을 생성하는 기능
퍼즐들을 랜덤 배치를 위한 섞는 기능
*/

// events

imgContainer.addEventListener("dragstart", (e) => {
  if (!isPlaying) return;
  const obj = e.target;
  dragged.el = obj;
  dragged.class = obj.className;
  dragged.index = [...obj.parentNode.children].indexOf(obj);
  console.log({ obj });
  //e.target.parentNode.children : 배열이 아니라 컬렉션으로 유사배열이며 순수 오브젝트임
});
imgContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
  console.log("dragover");
});
imgContainer.addEventListener("drop", (e) => {
  // 엘리먼트를 드롭했을때 일어날 동작들
  // 코드 이해가 우선이 아니라 게임의 동작 원리를 먼저 파악하고
  // 스텝 바이 스텝으로 나누어서 작업하자
  // 결과에 어떤 문제가 발생하면 문제 분석을 하고 코드를 어떻게 짜야할지 생각해야함
  const obj = e.target;
  if (!isPlaying) return;
  if (obj.className !== dragged.class) {
    let originPlace;
    let isLast = false;

    if (dragged.el.nextSibling) {
      originPlace = dragged.el.nextSibling;
    } else {
      originPlace = dragged.el.previousSibling;
      isLast = true;
    }
    const droppedIndex = [...obj.parentNode.children].indexOf(obj);
    dragged.index > droppedIndex
      ? obj.before(dragged.el)
      : obj.after(dragged.el);
    isLast ? originPlace.after(obj) : originPlace.before(obj);
    checkStatus();
  }
});

startButton.addEventListener("click", () => {
  setGame();
});
