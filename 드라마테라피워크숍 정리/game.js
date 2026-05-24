const canvas = document.querySelector("#stage");
const ctx = canvas.getContext("2d");
const sceneTag = document.querySelector("#sceneTag");
const sceneTitle = document.querySelector("#sceneTitle");
const sceneText = document.querySelector("#sceneText");
const statusText = document.querySelector("#statusText");
const speakerName = document.querySelector("#speakerName");
const choicesEl = document.querySelector("#choices");
const progressBar = document.querySelector("#progressBar");
const timerEl = document.querySelector("#timer");

const W = canvas.width;
const H = canvas.height;

const game = {
  scene: 0,
  tick: 0,
  scanned: new Set(),
  lastScanned: "",
  selectedRoles: [],
  lastRole: "",
  examined: new Set(),
  lastSymbol: "",
  roleStep: 0,
  roleChoices: {},
  mirrorStep: 0,
  finalProps: [],
  finalLine: "",
};

const bodyScan = [
  ["눈", "렌즈가 뻑뻑하다. 보는 일이 조금 피곤하다."],
  ["어깨", "승모근에 중재자의 의자가 얹혀 있다."],
  ["가슴", "한숨이 말보다 먼저 나온다."],
  ["손", "누군가에게 보낼 문장을 쥐고만 있다."],
  ["배", "화해시키고 싶은 마음과 그만하고 싶은 마음이 같이 있다."],
];

const roleCards = [
  "딸",
  "동생",
  "자매",
  "중재자",
  "효녀",
  "정 많은 사람",
  "관객",
  "제작자",
];

const symbols = [
  ["선물", "오빠에게 선물은 사과의 말 대신 먼저 내미는 몸짓이다."],
  ["도끼", "도끼는 폭력이 아니라 막힌 관계를 어떻게든 열어 보려는 조급함이다."],
  ["나무", "엄마-나무는 쓰러지지 않는다. 단단함은 상처의 방어일 수도 있다."],
  ["의자", "의자에 앉은 도은은 게으른 사람이 아니라 잠깐 멈춘 사람이다."],
  ["카톡창", "저장명 하나가 가족의 거리를 갑자기 선명하게 만든다."],
  ["아빠의 불빛", "아빠의 방에는 말보다 오래 켜져 있는 슬픔이 있다."],
];

const symbolDialogues = {
  "선물": ["오빠", "말이 너무 늦었지.\n그래도 빈손으로는 못 오겠어서, 이걸 들고 왔어."],
  "도끼": ["오빠의 조급함", "문이 안 열리면, 자꾸 힘으로라도 열어야 할 것 같아.\n사실 나도 무서워."],
  "나무": ["엄마", "나는 안 쓰러질 거야.\n안 그러면 내가 먼저 너무 아플 것 같거든."],
  "의자": ["도은", "나는 옆에 앉아 있어.\n화가 난 것도 아니고, 괜찮은 것도 아니야. 그냥 힘이 빠졌어."],
  "카톡창": ["언니", "이렇게 저장해야 내가 덜 흔들려.\n가까운 말이 항상 가까운 마음은 아니니까."],
  "아빠의 불빛": ["아빠", "누가 이기고 지는 건 바라지 않아.\n그냥 다들 조금 덜 아팠으면 좋겠다."],
};

const mirrorDialogues = [
  ["오빠", "이 선물은 내가 아직 포기하지 않았다는 표시야."],
  ["엄마", "내 눈에는 이 선물이 너무 늦게 온 말처럼 보여."],
  ["도은", "나한테는 이 선물이 다시 움직이라는 신호처럼 무거워."],
  ["아빠", "나는 이 선물을 보고 아직 불이 꺼지지 않았다고 생각해."],
];

const roleScenes = [
  {
    key: "brother",
    label: "오빠",
    text:
      "오빠는 결혼했고 부모님과 따로 산다. 곧 영국으로 떠나야 해서 캐리어가 옆에 있다.\n선물은 들고 왔지만, 시간도 같이 들고 왔다.",
    choices: [
      ["선물을 엄마-나무 아래에 조심히 둔다", "오빠의 사과는 완성된 문장이 아니라 도착한 물건이 된다."],
      ["출국 시간을 확인하고 다시 말문을 닫는다", "떠나는 사람의 조급함이 무대 위에 남는다."],
    ],
  },
  {
    key: "mother",
    label: "엄마",
    text:
      "엄마는 친딸과 비친딸, 친아들과 비친아들이라는 말들이 가족 안에 들어온 순간을 견디고 있다.\n나무가 된 몸은 쉽게 흔들리지 않는다.",
    choices: [
      ["가지 하나만 흔든다", "엄마의 마음은 풀리지 않았지만, 완전히 닫힌 것도 아니다."],
      ["뿌리를 더 깊게 내린다", "상처받은 사람은 때로 움직이지 않는 방식으로 자신을 지킨다."],
    ],
  },
  {
    key: "sister",
    label: "언니",
    text:
      "카톡 저장명 '나영맘'은 차가운 말처럼 보인다.\n하지만 언니에게는 가까워지고 싶어서가 아니라 무너지지 않으려고 만든 거리일 수도 있다.",
    choices: [
      ["저장명을 바라보다가 폰을 내려놓는다", "도은은 타인의 거리두기를 곧바로 배신으로 번역하지 않아 보기로 한다."],
      ["대화창에 아무 말도 쓰지 않는다", "말하지 않음도 하나의 역할이라는 것을 본다."],
    ],
  },
  {
    key: "father",
    label: "아빠",
    text:
      "아빠는 조용히 슬퍼 보인다.\n도은은 그 표정을 보면 다시 무대 중앙으로 달려가고 싶어진다.",
    choices: [
      ["아빠 옆에 앉는다", "해결하지 않아도 곁에 있는 장면이 생긴다."],
      ["아빠의 방 불을 조금 낮춘다", "슬픔을 꺼 버리지는 않고, 눈이 아프지 않게 만든다."],
    ],
  },
  {
    key: "doeun",
    label: "도은",
    text:
      "모든 역할을 돌아본 뒤에도 도은은 여전히 지쳤다.\n하지만 이제 지침은 실패가 아니라 몸이 보내는 정보가 된다.",
    choices: [
      ["오늘은 한 문장만 남기기로 한다", "도은은 연출자가 될 수 있지만 모든 배역을 대신 연기하지 않는다."],
      ["숨을 고르고 무대를 본다", "미적 거리가 생긴다. 이야기는 아직 공연 중이다."],
    ],
  },
];

const finalPropOptions = [
  "의자",
  "나무",
  "선물",
  "캐리어",
  "카톡창",
  "아빠의 불빛",
];

const finalLines = [
  "다녀와. 나는 여기서 너무 애쓰지 않고 기다려볼게.",
  "엄마에게도 시간이 필요하고, 나에게도 시간이 필요해.",
  "아빠, 내가 다 해결하진 못해도 옆에는 있을게.",
  "우리 가족은 아직 공연 중이다. 막이 내린 건 아니다.",
];

const scenes = [
  {
    tag: "프롤로그",
    title: "오늘의 무대",
    speaker: "도은",
    text:
      "나는 오늘 가족을 화해시키러 온 게 아니야.\n정확히 말하면, 그럴 힘이 아직 있는지 확인하러 왔어.",
    timer: "D-3 / 인천 -> 런던",
    type: "start",
  },
  {
    tag: "1막: 체크인",
    title: "한숨 의자",
    speaker: "도은",
    text:
      "말부터 꺼내면 또 내가 해결해야 할 것 같아.\n그러니까 먼저 몸부터 볼래. 지금 나는 어디가 제일 무겁지?",
    timer: "D-3 / 인천 -> 런던",
    type: "body",
  },
  {
    tag: "2막: 역할 나무",
    title: "나는 이것이고, 이것이 나를 흔든다",
    speaker: "도은",
    text:
      "나는 딸이고, 동생이고, 자매고, 자꾸 중재자가 돼.\n그런데 그 역할들 밑에는 뭐가 묻혀 있을까?",
    timer: "D-2 / 인천 -> 런던",
    type: "tree",
  },
  {
    tag: "3막: 상징 무대",
    title: "그림이 무대가 된다",
    speaker: "도은",
    text:
      "저 사람이 오빠야. 결혼해서 따로 살고, 곧 영국으로 떠나.\n선물도 들고 왔고, 조급한 마음도 같이 들고 왔어.",
    timer: "D-2 / 인천 -> 런던",
    type: "symbols",
  },
  {
    tag: "4막: 역할 스위치",
    title: "다른 자리에서 보기",
    speaker: "교수자",
    text:
      "이번에는 네가 각자의 자리에 서 볼 거예요.\n정답을 맞히는 시간이 아니라, 다른 몸 안에서 숨을 쉬어 보는 시간입니다.",
    timer: "D-1 / 인천 -> 런던",
    type: "switch",
  },
  {
    tag: "5막: 미러링",
    title: "같은 물건, 다른 마음",
    speaker: "교수자",
    text:
      "같은 선물도 보는 사람에 따라 다른 장면이 됩니다.\n지금부터는 선물이 누구의 마음으로 보이는지 따라가 보세요.",
    timer: "출국 당일 / 게이트 열림",
    type: "mirror",
  },
  {
    tag: "6막: 자전적 공연",
    title: "세 개의 오브제를 고른다",
    speaker: "도은",
    text:
      "이제 내가 내 공연을 만들 차례야.\n전부 올릴 수는 없어. 오늘 무대에 남길 것 세 개만 고를래.",
    timer: "출국 당일 / 탑승 대기",
    type: "final-props",
  },
  {
    tag: "커튼콜",
    title: "마지막 한 문장",
    speaker: "도은",
    text:
      "화해는 내가 혼자 완성하는 작품이 아니야.\n그래도 오늘 남길 수 있는 말은 하나쯤 있을 것 같아.",
    timer: "출국 당일 / 마지막 안내",
    type: "final-line",
  },
  {
    tag: "탈역할",
    title: "나는 다시 나로 돌아온다",
    speaker: "도은",
    text:
      "나는 오빠도, 엄마도, 언니도, 아빠도 대신하지 않는다.\n등을 한 번 토닥이고, 다시 내 자리로 돌아온다.",
    timer: "막이 내린 뒤",
    type: "ending",
  },
];

function rect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function text(label, x, y, size = 20, color = "#251f22", align = "center") {
  ctx.fillStyle = color;
  ctx.font = `900 ${size}px "Malgun Gothic", sans-serif`;
  ctx.textAlign = align;
  ctx.fillText(label, x, y);
}

function drawBackdrop() {
  rect(0, 0, W, H, "#f9d9cc");
  rect(0, 0, W, 74, "#2f252a");
  rect(0, 74, 50, H, "#423039");
  rect(W - 50, 74, 50, H, "#423039");
  rect(70, 92, W - 140, 306, "#fbe8da");
  rect(94, 116, W - 188, 270, "#fff1e6");
  rect(70, 398, W - 140, 76, "#c98570");
  rect(92, 430, W - 184, 16, "#ad6b5c");
  rect(120, 112, W - 240, 260, "rgba(255,255,255,0.26)");

  ctx.globalAlpha = 0.34;
  ctx.fillStyle = "#fff7bf";
  ctx.beginPath();
  ctx.moveTo(224, 74);
  ctx.lineTo(360, 398);
  ctx.lineTo(112, 398);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(724, 74);
  ctx.lineTo(862, 398);
  ctx.lineTo(590, 398);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  for (let i = 0; i < 13; i += 1) {
    rect(108 + i * 58, 88, 22, 14, i % 2 ? "#f2c94c" : "#fff8b8");
  }

  for (let i = 0; i < 7; i += 1) {
    rect(120 + i * 106, 406 + (i % 2) * 18, 74, 4, "rgba(47,37,42,0.12)");
  }
}

function drawTag(label, x, y, color = "#fffdf8") {
  const width = Math.max(82, label.length * 18 + 24);
  rect(x - width / 2, y - 20, width, 30, color);
  rect(x - width / 2, y - 20, width, 3, "#2f252a");
  rect(x - width / 2, y + 7, width, 3, "#2f252a");
  rect(x - width / 2, y - 20, 3, 30, "#2f252a");
  rect(x + width / 2 - 3, y - 20, 3, 30, "#2f252a");
  text(label, x, y + 1, 15);
}

function drawSpeech(x, y, lines, color = "#fffdf8", tailX = null) {
  const width = 250;
  const height = 36 + lines.length * 22;
  rect(x + 5, y + 5, width, height, "rgba(37,31,34,0.14)");
  rect(x, y, width, height, color);
  rect(x, y, width, 4, "#2f252a");
  rect(x, y + height - 4, width, 4, "#2f252a");
  rect(x, y, 4, height, "#2f252a");
  rect(x + width - 4, y, 4, height, "#2f252a");
  if (tailX !== null) {
    const tx = Math.max(x + 28, Math.min(x + width - 34, tailX));
    rect(tx, y + height - 4, 20, 18, color);
    rect(tx, y + height + 10, 20, 4, "#2f252a");
    rect(tx, y + height - 4, 4, 18, "#2f252a");
    rect(tx + 16, y + height - 4, 4, 18, "#2f252a");
  }
  lines.forEach((line, index) => text(line, x + width / 2, y + 30 + index * 22, 16));
}

function drawPerson(x, y, colors, mode = "stand") {
  const bob = Math.sin(game.tick / 18 + x) * 2;
  const yy = y + bob;
  rect(x - 36, yy + 76, 72, 10, "rgba(37,31,34,0.18)");
  rect(x - 18, yy - 58, 36, 30, colors.hair);
  rect(x - 12, yy - 64, 24, 8, colors.hair);
  rect(x - 14, yy - 50, 28, 26, colors.skin);
  rect(x - 7, yy - 40, 4, 4, "#251f22");
  rect(x + 7, yy - 40, 4, 4, "#251f22");
  rect(x - 6, yy - 30, 14, 4, "#7a3f3b");
  rect(x - 22, yy - 24, 44, 58, colors.body);
  rect(x - 14, yy - 12, 28, 10, "rgba(255,255,255,0.28)");
  rect(x - 34, yy - 15, 12, 44, colors.body);
  rect(x + 22, yy - 15, 12, 44, colors.body);
  rect(x - 18, yy + 34, 14, 44, colors.legs);
  rect(x + 4, yy + 34, 14, 44, colors.legs);
  rect(x - 20, yy + 76, 18, 6, "#2f252a");
  rect(x + 2, yy + 76, 18, 6, "#2f252a");

  if (mode === "sit") {
    rect(x - 36, yy + 30, 72, 12, "#674b4f");
    rect(x - 31, yy + 42, 9, 46, "#674b4f");
    rect(x + 22, yy + 42, 9, 46, "#674b4f");
    rect(x - 24, yy + 44, 20, 16, colors.legs);
    rect(x + 4, yy + 44, 20, 16, colors.legs);
  }
}

function drawTree(x, y, mood = 0) {
  rect(x - 54, y + 26, 108, 12, "rgba(37,31,34,0.18)");
  rect(x - 25, y - 104, 50, 132, "#8b5a38");
  rect(x - 8, y - 92, 10, 118, "#a96a3d");
  rect(x - 70, y - 20, 44, 14, "#8b5a38");
  rect(x + 26, y - 20, 44, 14, "#8b5a38");
  rect(x - 40, y - 8, 80, 24, "#75482f");
  const leafColors = ["#4e8f5b", "#5aa469", "#76b777"];
  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI * 2 * i) / 8;
    const sway = mood ? Math.sin(game.tick / 22 + i) * 5 : 0;
    rect(x + Math.cos(angle) * 54 - 34 + sway, y - 130 + Math.sin(angle) * 38, 68, 56, leafColors[i % 3]);
  }
  rect(x - 55, y - 142, 110, 78, "#5aa469");
  rect(x - 34, y - 150, 78, 24, "#76b777");
  rect(x - 10, y - 84, 8, 8, "#251f22");
  rect(x + 14, y - 84, 8, 8, "#251f22");
  rect(x - 8, y - 62, 34, 6, "#251f22");
  if (mood > 1) {
    rect(x + 32, y - 28, 14, 8, "#f2c94c");
    rect(x + 40, y - 20, 8, 16, "#f2c94c");
  }
}

function drawGift(x, y) {
  rect(x - 26, y + 18, 52, 7, "rgba(37,31,34,0.16)");
  rect(x - 22, y - 16, 44, 32, "#e86f78");
  rect(x - 4, y - 16, 8, 32, "#f2c94c");
  rect(x - 22, y - 2, 44, 8, "#f2c94c");
  rect(x - 12, y - 28, 24, 12, "#e86f78");
  rect(x - 22, y - 16, 44, 4, "#ff9ca3");
}

function drawAxe(x, y) {
  rect(x - 4, y - 44, 8, 72, "#8b5a38");
  rect(x - 26, y - 50, 30, 24, "#aab2bd");
  rect(x - 30, y - 44, 10, 12, "#d8dde3");
}

function drawSuitcase(x, y) {
  rect(x - 32, y + 28, 64, 7, "rgba(37,31,34,0.16)");
  rect(x - 30, y - 28, 60, 50, "#485c9b");
  rect(x - 18, y - 40, 36, 14, "#2f252a");
  rect(x - 30, y - 28, 60, 6, "#2f252a");
  rect(x - 18, y + 22, 10, 10, "#2f252a");
  rect(x + 8, y + 22, 10, 10, "#2f252a");
  rect(x + 16, y - 12, 8, 24, "#6f84cf");
  text("UK", x, y + 4, 16, "#fffdf8");
}

function drawChat(x, y) {
  rect(x, y, 170, 112, "#fffdf8");
  rect(x, y, 170, 18, "#5aa469");
  text("나영맘", x + 85, y + 44, 18);
  rect(x + 18, y + 58, 88, 28, "#d9ebd0");
  rect(x + 118, y + 86, 32, 8, "#cfc7be");
}

function drawLetter(x, y) {
  rect(x, y, 144, 96, "#fff8ef");
  rect(x + 8, y + 12, 128, 4, "#2f252a");
  rect(x + 14, y + 30, 70, 5, "#485c9b");
  text("감사합니다", x + 72, y + 60, 18);
  text("존경합니다", x + 72, y + 82, 18);
}

function drawAirportBanner() {
  rect(352, 96, 256, 52, "#2f252a");
  text("INC -> LONDON", 480, 128, 22, "#f2c94c");
  rect(606, 108, 36, 12, "#fffdf8");
  rect(636, 112, 18, 6, "#fffdf8");
}

function drawStage() {
  drawBackdrop();
  const scene = scenes[game.scene];

  if (scene.type === "start") {
    drawPerson(480, 310, { hair: "#2f252a", skin: "#f0b69d", body: "#e86f78", legs: "#485c9b" }, "sit");
    drawSpeech(344, 138, ["숨을 고르고", "무대를 연다"]);
    drawAirportBanner();
  }

  if (scene.type === "body") {
    drawPerson(480, 310, { hair: "#2f252a", skin: "#f0b69d", body: "#e86f78", legs: "#485c9b" }, "sit");
    bodyScan.forEach(([part], index) => {
      const x = 208 + index * 136;
      const y = 132 + Math.sin(game.tick / 18 + index) * 4;
      rect(x - 48, y - 22, 96, 44, game.scanned.has(part) ? "#d9ebd0" : "#fffdf8");
      text(part, x, y + 7, 18);
    });
    drawSpeech(362, 374, ["몸은 이미", "알고 있다"]);
  }

  if (scene.type === "tree") {
    drawTree(480, 298, game.selectedRoles.includes("정 많은 사람") ? 2 : 1);
    game.selectedRoles.forEach((role, index) => {
      const x = 270 + (index % 4) * 140;
      const y = index < 4 ? 118 : 380;
      rect(x - 50, y - 18, 100, 36, role === "정 많은 사람" ? "#f7d9df" : "#fffdf8");
      text(role, x, y + 7, 16);
    });
    text("뿌리: 허무 / 미안함 / 그리움 / 내가 왜?", 480, 475, 20, "#5c4a2b");
  }

  if (scene.type === "symbols" || scene.type === "switch" || scene.type === "mirror") {
    const treeMood = scene.type === "switch" && game.roleStep > 1 ? 2 : 0;
    drawPerson(300, 310, { hair: "#2f252a", skin: "#e9ad92", body: "#79a6d2", legs: "#3e4d70" });
    drawGift(338, 354);
    drawAxe(376, 350);
    drawSuitcase(132, 366);
    drawTree(512, 300, treeMood);
    drawPerson(760, 320, { hair: "#2f252a", skin: "#f0b69d", body: "#e86f78", legs: "#485c9b" }, "sit");
    drawTag("오빠", 300, 236, "#dcecff");
    drawTag("결혼/따로 삶", 300, 446, "#fffdf8");
    drawTag("출국 캐리어", 132, 416, "#eef6f7");
    drawTag("엄마-나무", 512, 186, "#d9ebd0");
    drawTag("도은", 760, 244, "#f7d9df");
    drawTag("선물", 338, 398, "#fff4bd");
    rect(704, 134, 118, 86, "#fff4bd");
    rect(716, 146, 94, 62, "#f2c94c");
    text("아빠의 방", 763, 244, 18, "#5c4a2b");
    if (scene.type === "symbols") {
      drawChat(88, 184);
      drawLetter(702, 176);
    }
    if (scene.type === "switch") {
      drawAirportBanner();
      text(roleScenes[Math.min(game.roleStep, roleScenes.length - 1)].label, 480, 78, 24, "#fffdf8");
      const current = roleScenes[game.roleStep];
      if (current) drawSpeech(348, 176, [current.label, "내 자리에서 골라줘"], "#fffdf8", 486);
    }
    if (scene.type === "mirror") {
      const views = ["오빠: 사과", "엄마: 늦은 증거", "도은: 부담", "아빠: 희망"];
      views.forEach((v, i) => {
        rect(142 + i * 178, 118, 144, 42, i === game.mirrorStep ? "#f7d9df" : "#fffdf8");
        text(v, 214 + i * 178, 144, 16);
      });
      drawSpeech(348, 178, [mirrorDialogues[game.mirrorStep][0], mirrorDialogues[game.mirrorStep][1].slice(0, 18)], "#fffdf8", 486);
    }
  }

  if (scene.type === "final-props" || scene.type === "final-line" || scene.type === "ending") {
    drawAirportBanner();
    rect(70, 286, 405, 6, "#2f252a");
    rect(486, 286, 404, 6, "#2f252a");
    text("공항", 270, 326, 24, "#485c9b");
    text("거실", 690, 326, 24, "#8b5a38");
    drawPerson(480, 332, { hair: "#2f252a", skin: "#f0b69d", body: "#e86f78", legs: "#485c9b" }, "sit");

    const props = scene.type === "ending" ? game.finalProps : game.finalProps;
    props.forEach((prop, index) => {
      const x = 210 + index * 170;
      const y = 396;
      if (prop === "의자") rect(x - 34, y - 8, 68, 48, "#674b4f");
      if (prop === "나무") drawTree(x, y - 16, 2);
      if (prop === "선물") drawGift(x, y);
      if (prop === "캐리어") drawSuitcase(x, y);
      if (prop === "카톡창") drawChat(x - 80, y - 70);
      if (prop === "아빠의 불빛") {
        rect(x - 42, y - 70, 84, 64, "#fff4bd");
        text("불빛", x, y - 32, 18, "#5c4a2b");
      }
    });

    if (scene.type === "ending") {
      drawSpeech(332, 112, ["혼자 모든 배역을", "대신하지 않는다"]);
    }
  }
}

function setScene(next) {
  game.scene = Math.max(0, Math.min(scenes.length - 1, next));
  render();
}

function addButton(label, onClick, options = {}) {
  const button = document.createElement("button");
  button.className = `choice ${options.className || ""}`.trim();
  button.type = "button";
  button.textContent = label;
  button.disabled = Boolean(options.disabled);
  if (options.selected) button.classList.add("selected");
  button.addEventListener("click", onClick);
  choicesEl.append(button);
}

function statusForScene(scene) {
  if (scene.type === "body") {
    const recent = [...game.scanned].slice(-1)[0];
    if (!recent) return "몸의 감각을 하나씩 눌러 체크인한다.";
    return `방금 확인한 감각: ${recent}\n체크인이 끝나면 역할 나무로 이동한다.`;
  }
  if (scene.type === "tree") {
    if (!game.selectedRoles.length) return "역할 카드를 고르면 나무의 잎과 뿌리가 채워진다.";
    return `붙인 역할: ${game.selectedRoles.join(", ")}\n네 장 이상 고르면 상징 무대로 이동한다.`;
  }
  if (scene.type === "symbols") {
    if (!game.examined.size) return "오브제를 눌러 각 인물의 대사를 들어 본다.";
    return `확인한 오브제: ${[...game.examined].join(", ")}\n네 개 이상 확인하면 역할 스위치로 넘어간다.`;
  }
  if (scene.type === "switch") {
    const current = roleScenes[Math.min(game.roleStep, roleScenes.length - 1)];
    return current ? `${current.label}의 자리에서 한 행동을 고른다.` : "역할 스위치를 마쳤다.";
  }
  if (scene.type === "mirror") {
    return "같은 선물이 시선에 따라 다른 의미로 바뀐다.";
  }
  if (scene.type === "final-props") {
    return game.finalProps.length
      ? `무대 위 오브제: ${game.finalProps.join(", ")}`
      : "세 개의 오브제를 고른다.";
  }
  if (scene.type === "final-line") {
    return game.finalLine || "마지막 한 문장을 고른다.";
  }
  if (scene.type === "ending") {
    return `오늘의 문장: ${game.finalLine}`;
  }
  return "5분짜리 공연을 시작한다.";
}

function dialogueForScene(scene) {
  if (scene.type === "body" && game.lastScanned) {
    return ["도은의 몸", bodyScan.find(([part]) => part === game.lastScanned)[1]];
  }

  if (scene.type === "tree" && game.lastRole) {
    if (game.lastRole === "정 많은 사람") {
      return ["역할 나무", "정 많은 사람은 나를 도와주기도 하고, 나를 방해하기도 해."];
    }
    return ["역할 나무", `${game.lastRole} 역할이 잎사귀에 붙었다.\n이 역할 아래에는 어떤 뿌리가 있을까?`];
  }

  if (scene.type === "symbols" && game.lastSymbol) {
    return symbolDialogues[game.lastSymbol];
  }

  if (scene.type === "switch") {
    const current = roleScenes[game.roleStep];
    if (current) return [current.label, current.text];
    return ["도은", "다른 자리들을 지나오니, 누가 단순한 악역인지는 잘 모르겠어."];
  }

  if (scene.type === "mirror") {
    return mirrorDialogues[game.mirrorStep];
  }

  if (scene.type === "final-props" && game.finalProps.length) {
    return ["도은", `오늘 무대에는 ${game.finalProps.join(", ")}.\n이 세 가지면 지금의 나를 말할 수 있을 것 같아.`];
  }

  if (scene.type === "final-line" && game.finalLine) {
    return ["도은", game.finalLine];
  }

  return [scene.speaker || "도은", scene.text];
}

function renderChoices(scene) {
  choicesEl.innerHTML = "";

  if (scene.type === "start") {
    addButton("공연 시작하기", () => setScene(1), { className: "primary" });
    return;
  }

  if (scene.type === "body") {
    bodyScan.forEach(([part]) => {
      addButton(part, () => {
        game.scanned.add(part);
        game.lastScanned = part;
        render();
      }, { selected: game.scanned.has(part) });
    });
    addButton("감각을 들고 역할 나무로 간다", () => setScene(2), {
      className: "primary",
      disabled: game.scanned.size < bodyScan.length,
    });
    return;
  }

  if (scene.type === "tree") {
    roleCards.forEach((role) => {
      addButton(role, () => {
        if (game.selectedRoles.includes(role)) {
          game.selectedRoles = game.selectedRoles.filter((item) => item !== role);
        } else if (game.selectedRoles.length < 5) {
          game.selectedRoles.push(role);
          game.lastRole = role;
        }
        render();
      }, { selected: game.selectedRoles.includes(role) });
    });
    addButton("나무를 무대로 옮긴다", () => setScene(3), {
      className: "primary",
      disabled: game.selectedRoles.length < 4,
    });
    return;
  }

  if (scene.type === "symbols") {
    symbols.forEach(([name]) => {
      addButton(name, () => {
        game.examined.add(name);
        game.lastSymbol = name;
        render();
      }, { selected: game.examined.has(name) });
    });
    addButton("역할을 바꿔 본다", () => setScene(4), {
      className: "primary",
      disabled: game.examined.size < 4,
    });
    return;
  }

  if (scene.type === "switch") {
    const current = roleScenes[game.roleStep];
    if (!current) {
      addButton("같은 물건을 다르게 본다", () => setScene(5), { className: "primary" });
      return;
    }
    current.choices.forEach(([label, result]) => {
      addButton(label, () => {
        game.roleChoices[current.key] = result;
        game.roleStep += 1;
        render();
      });
    });
    return;
  }

  if (scene.type === "mirror") {
    addButton("다음 시선으로 보기", () => {
      if (game.mirrorStep < 3) {
        game.mirrorStep += 1;
        render();
      } else {
        setScene(6);
      }
    }, { className: game.mirrorStep < 3 ? "quiet" : "primary" });
    return;
  }

  if (scene.type === "final-props") {
    finalPropOptions.forEach((prop) => {
      addButton(prop, () => {
        if (game.finalProps.includes(prop)) {
          game.finalProps = game.finalProps.filter((item) => item !== prop);
        } else if (game.finalProps.length < 3) {
          game.finalProps.push(prop);
        }
        render();
      }, { selected: game.finalProps.includes(prop) });
    });
    addButton("마지막 문장으로 간다", () => setScene(7), {
      className: "primary",
      disabled: game.finalProps.length !== 3,
    });
    return;
  }

  if (scene.type === "final-line") {
    finalLines.forEach((line) => {
      addButton(line, () => {
        game.finalLine = line;
        setScene(8);
      });
    });
    return;
  }

  if (scene.type === "ending") {
    addButton("처음부터 다시 공연하기", () => {
      game.scene = 0;
      game.scanned = new Set();
      game.lastScanned = "";
      game.selectedRoles = [];
      game.lastRole = "";
      game.examined = new Set();
      game.lastSymbol = "";
      game.roleStep = 0;
      game.roleChoices = {};
      game.mirrorStep = 0;
      game.finalProps = [];
      game.finalLine = "";
      render();
    }, { className: "quiet" });
  }
}

function render() {
  const scene = scenes[game.scene];
  const [speaker, line] = dialogueForScene(scene);
  sceneTag.textContent = scene.tag;
  sceneTitle.textContent = scene.title;
  speakerName.textContent = speaker;
  sceneText.textContent = line;
  timerEl.textContent = scene.timer;
  statusText.textContent = statusForScene(scene);
  progressBar.style.width = `${(game.scene / (scenes.length - 1)) * 100}%`;
  renderChoices(scene);
  drawStage();
}

function loop() {
  game.tick += 1;
  drawStage();
  requestAnimationFrame(loop);
}

render();
loop();
