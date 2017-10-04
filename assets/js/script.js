const $gameBoard = $(".gameBoard")
const $body = $("body")
const gameWidth = parseInt($gameBoard.css("width"))
const gameHeight = parseInt($gameBoard.css("height"))
const $score = $(".score")
const $hitpoint = $(".hitpoints")
const $pauseBtn = $("#pauseBtn")
const $startBtn = $("#startBtn")
const $restartBtn = $("#restartBtn")
const $loseDiv = $("<div class='lose'>")
const $house = $(".house")
const catMeow = new Audio("/assets/audio/catMeow.mp3")
let enemyList = []
let bulletList = []
let upgradeList = []
let petList = []
let score = 0
let pause = true
let gameCounter = 0

class Character {
  constructor(
    type,
    id,
    sizeX,
    sizeY,
    spdX,
    spdY,
    hp,
    x,
    y,
    atkSpd,
    bulletOwner,
    aniFrame,
    aimAngle
  ) {
    this.type = type
    this.id = id
    this.jTarget = $gameBoard.find("." + this.id)
    this.sizeX = sizeX
    this.sizeY = sizeY
    this.spdX = spdX
    this.spdY = spdY
    this.hp = hp
    this.x = x //spawn position
    this.y = y
    this.timer = 0 //how long has this asset been in the game?
    this.atkSpd = atkSpd //per ms. Lower faster
    this.isShooting = false
    this.pressingDown = false
    this.pressingUp = false
    this.pressingLeft = false
    this.pressingRight = false
    this.aimAngle = aimAngle
    this.bulletOwner = bulletOwner
    this.aniFrame = 0
    this.bulletMod = 0
  }

  addChar() {
    let $char = $("<div>")
    $char.addClass(`${this.id}`)
    $char.css({
      position: "absolute",
      width: `${this.sizeX}px`,
      height: `${this.sizeY}px`
    })
    //fix for bullet

    $gameBoard.append($char)
    this.jTarget = $gameBoard.find(`.${this.id}`)

    if (this.type === "player") {
      this.jTarget.css({
        // border: "3px solid green" //update to actual sprite
        background: `url("/assets/images/playerRed1.png")`,
        backgroundPosition: "0 -190px",
        backgroundSize: `350%`
      })
    }

    if (this.type === "enemy") {
      this.jTarget.css({
        // border: "3px solid red", //update to actual sprite
        background: `url("/assets/images/onionFace2.png")`,
        backgroundPosition: `0px -200px`,
        backgroundSize: "350%"
      })
    }

    if (this.type === "upgrade") {
      this.jTarget.css({
        border: "3px solid green" //update to actual sprite
        // background: `url("/assets/images/cat.png")`
      })
    }

    if (this.type === "cow") {
      this.jTarget.css({
        background: 'url("/assets/images/cow.png")'
      })
    }

    if (this.type === "cat") {
      let randomCat = Math.random()
      if (randomCat < 0.333) {
        this.jTarget.css({
          background: `url("/assets/images/weilisCat1.png")`,
          backgroundPosition: `0px -200px`,
          backgroundSize: "450%"
        })
      } else if (randomCat > 0.333 && randomCat < 0.666) {
        this.jTarget.css({
          background: `url("/assets/images/weilisCat2.png")`,
          backgroundPosition: `0px -200px`,
          backgroundSize: "450%"
        })
      } else
        this.jTarget.css({
          background: `url("/assets/images/weilisCat3.png")`,
          backgroundPosition: `0px -200px`,
          backgroundSize: "450%"
        })
    }

    if (this.type === "bullet") {
      if (this.bulletOwner === "enemy") {
        this.jTarget.css({
          border: "3px solid black", //update to actual sprite
          borderRadius: "50%"
        })
      } else {
        this.jTarget.css({
          background: `url("/assets/images/fireball.png")`,
          backgroundPosition: `50px -45px`,
          // border: "3px solid black", //update to actual sprite
          backgroundSize: "200%"
        })
      }
    }
  }

  removeChar() {
    this.jTarget.remove()
  }

  moveChar() {
    this.jTarget.css({
      left: `${this.x}px`,
      top: `${this.y}px`
    })

    if (
      this.type === "enemy" ||
      this.type === "upgrade" ||
      this.type === "cow"
    ) {
      this.x += this.spdX
      this.y += this.spdY
      if (this.spdX > 0) {
        this.jTarget.css({
          backgroundPosition: `${Math.floor(this.aniFrame % 3) * 70}px -100px`
        })
      }
      if (this.spdX < 0) {
        this.jTarget.css({
          backgroundPosition: `${Math.floor(this.aniFrame % 3) * 70}px -290px`
        })
      }
      if (this.spdY > 0 && this.spdY > this.spdX) {
        this.jTarget.css({
          backgroundPosition: `${Math.floor(this.aniFrame % 3) * 70}px -200px`
        })
      }
      if (this.spdY < 0 && this.spdY > this.spdX) {
        this.jTarget.css({
          backgroundPosition: `${Math.floor(this.aniFrame % 3) * 70}px -20px`
        })
      }
      this.aniFrame += 0.07
      //enemy collision with border
      if (this.x <= 0 || this.x >= gameWidth - this.sizeX) this.spdX *= -1 //border collision x
      if (this.y <= 0 || this.y >= gameHeight - this.sizeY) this.spdY *= -1 //border collision y
    }

    if (this.type === "cat") {
      this.x += this.spdX
      this.y += this.spdY
      if (this.spdX === 0) {
        this.jTarget.css({
          backgroundPosition: `${Math.floor(this.aniFrame % 4) *
            -67.5}px -270px`
        })
      }
      if (this.spdX > 0 && this.spdY > 0) {
        //right
        this.jTarget.css({
          backgroundPosition: `${Math.floor(this.aniFrame % 4) *
            -67.5}px -200px`
        })
      }
      if (this.spdX < 0 && this.spdY > 0) {
        //left
        this.jTarget.css({
          backgroundPosition: `${Math.floor(this.aniFrame % 4) * -67.5}px 0px`
        })
      }
      if (this.spdX > 0 && this.spdY < 0) {
        //down
        this.jTarget.css({
          backgroundPosition: `${Math.floor(this.aniFrame % 4) *
            -67.5}px -132px`
        })
      }
      if (this.spdX < 0 && this.spdY < 0) {
        //up
        this.jTarget.css({
          backgroundPosition: `${Math.floor(this.aniFrame % 4) * -67.5}px -65px`
        })
      }
      this.aniFrame += 0.1
      //enemy collision with border

      if (this.x <= 0 || this.x >= gameWidth - this.sizeX) this.spdX *= -1 //border collision x
      if (this.y <= 0 || this.y >= gameHeight - this.sizeY) this.spdY *= -1 //border collision y
    }

    if (this.type === "bullet") {
      this.x += this.spdX
      this.y += this.spdY
      if (this.x <= 0 || this.x >= gameWidth - this.sizeX) this.removeChar() //border collision x
      if (this.y <= 0 || this.y >= gameHeight - this.sizeY) this.removeChar()
      if (Math.floor(this.aniFrame % 4) === 0) {
        this.jTarget.css({
          backgroundPosition: `0 0`,
          transform: `rotate(${this.aimAngle - 90}deg)`
        })
      } else if (Math.floor(this.aniFrame % 4) === 1) {
        this.jTarget.css({ backgroundPosition: `50px 0` })
      } else if (Math.floor(this.aniFrame % 4) === 2) {
        this.jTarget.css({ backgroundPosition: `0 -48px` })
      } else {
        this.jTarget.css({ backgroundPosition: `50px -48px` })
      }
      this.aniFrame += 0.15
    }

    if (this.type === "player") {
      $body.on("keydown", e => {
        if (e.key === "w" || e.key === "ArrowUp") {
          player.pressingUp = true
        } else if (e.key === "a" || e.key === "ArrowLeft") {
          player.pressingLeft = true
        } else if (e.key === "s" || e.key === "ArrowDown") {
          player.pressingDown = true
        } else if (e.key === "d" || e.key === "ArrowRight") {
          player.pressingRight = true
        }
      })
      $body.on("keyup", e => {
        if (e.key === "w" || e.key === "ArrowUp") {
          player.pressingUp = false
        } else if (e.key === "a" || e.key === "ArrowLeft") {
          player.pressingLeft = false
        } else if (e.key === "s" || e.key === "ArrowDown") {
          player.pressingDown = false
        } else if (e.key === "d" || e.key === "ArrowRight") {
          player.pressingRight = false
        }
      })

      if (player.pressingRight) {
        this.jTarget.css({
          backgroundPosition: `${Math.floor(this.aniFrame % 3) * 70}px -100px`
        })
        player.x += this.spdX
      }
      if (player.pressingLeft) {
        this.jTarget.css({
          backgroundPosition: `${Math.floor(this.aniFrame % 3) * 70}px -290px`
        })
        player.x -= 4
      }
      if (player.pressingDown) {
        this.jTarget.css({
          backgroundPosition: `${Math.floor(this.aniFrame % 3) * 70}px -190px`
        })
        player.y += 4
      }
      if (player.pressingUp) {
        this.jTarget.css({
          backgroundPosition: `${Math.floor(this.aniFrame % 3) * 70}px -10px`
        })
        player.y -= 4
      }

      //border collision
      if (player.x <= 0) player.x = 0
      if (player.y <= 0) player.y = 0
      if (player.x > gameWidth - player.sizeX - 4)
        player.x = gameWidth - player.sizeX - 4
      if (player.y > gameHeight - player.sizeY - 4)
        player.y = gameHeight - player.sizeY - 4

      //update aniFrame
      this.aniFrame += 0.06
    }
  }

  shoot() {
    if (pause === true) return
    if (this.type === "player") {
      //mouse targeting
      $gameBoard.on("mousemove", e => {
        let targetX = e.clientX - $gameBoard.offset().left //mouse X
        let targetY = e.clientY - $gameBoard.offset().top //mouse Y
        let distanceX = targetX - this.x - this.sizeX / 2
        let distanceY = targetY - this.y - this.sizeY / 2
        this.aimAngle = Math.atan2(distanceY, distanceX) / Math.PI * 180
      })
    }

    if (this.type === "enemy") {
      let targetX = player.x
      let targetY = player.y
      let distanceX = targetX - this.x - this.sizeX / 2
      let distanceY = targetY - this.y - this.sizeY / 2
      this.aimAngle = Math.atan2(distanceY, distanceX) / Math.PI * 180
    }

    for (let i = 0; i <= this.bulletMod; i++) {
      generateBullet(this)
      this.aimAngle += 5
    }
    // if (this.bulletMod === 0) generateBullet(this)
    // else (this.bulletMod === > 0) {
    //default 0 -> 1 bullet
    //   generateBullet(this)
    //   this.aimAngle += 5
    //   generateBullet(this)
    // }
    // if (this.bulletMod === "a") {
    //   //special bullets to be added
    // }
  }
}

//type, id, sizeX, sizeY, spdX, spdY, hp, x, y, atkSpd, bulletOwner, aniFrame
let player = new Character(
  "player",
  "player",
  60,
  90,
  4.5,
  4.5,
  100,
  50,
  50,
  1000,
  "",
  0
)

// const generateCow = () => {
//   //to be implemented
//   let id = Math.floor(Math.random() * 100000)
//   let sizeX = 60
//   let sizeY = 90
//   let spdX = Math.random() * 2.5
//   let spdY = Math.random() * 2.5
//   let x = 150
//   let y = 150
//
//   petList[id] = new Character("cow", id, sizeX, sizeY, spdX, spdY, 0, x, y)
//
//   petList[id].addChar()
// }

const generateCat = () => {
  let id = Math.floor(Math.random() * 100000)
  let sizeX = 60
  let sizeY = 80
  let spdModX = Math.random()
  let spdMultX = 1
  if (spdModX < 0.5) spdMultX = -1
  let spdModY = Math.random()
  let spdMultY = 1
  if (spdModY < 0.5) spdMultY = -1
  let spdX = Math.random() * 0.3 * spdMultX
  let spdY = Math.random() * 0.3 * spdMultY
  let x = Math.random() * 700 //to regenerate when spawned inside house
  let y = 330 + Math.random() * 200

  petList[id] = new Character("cat", id, sizeX, sizeY, spdX, spdY, 0, x, y)

  petList[id].addChar()
}

const generateEnemy = () => {
  let id = Math.floor(Math.random() * 100000) //To do: fix potential duplicate id
  let sizeX = 60
  let sizeY = 90
  let spdX = Math.random() * 2.5
  let spdY = Math.random() * 2.5
  let hp = 150
  let x = 360 + Math.random() * 350
  let y = Math.random() * 500
  let atkSpd = Math.floor(1000 + Math.random() * 1500)

  // console.log("spawning")
  enemyList[id] = new Character(
    "enemy",
    id,
    sizeX,
    sizeY,
    spdX,
    spdY,
    hp,
    x,
    y,
    atkSpd
  )

  enemyList[id].addChar()
}

const generateBullet = entity => {
  let id = Math.floor(Math.random() * 100000) //To do: fix potential duplicate id
  let angle = entity.aimAngle
  let sizeX = 50
  let sizeY = 50
  let spdX = Math.cos(angle / 180 * Math.PI) * 5
  let spdY = Math.sin(angle / 180 * Math.PI) * 5
  let hp = 0
  let x = entity.x + entity.sizeX / 2
  let y = entity.y + entity.sizeY / 2
  let owner = entity.type

  bulletList[id] = new Character(
    "bullet",
    id,
    sizeX,
    sizeY,
    spdX,
    spdY,
    hp,
    x,
    y,
    0,
    owner,
    0,
    angle
  )
  bulletList[id].addChar()
}

const generateUpgrade = () => {
  let id = Math.floor(Math.random() * 100000) //To do: fix potential duplicate id
  let sizeX = 20
  let sizeY = 20
  let spdX = Math.random()
  let spdY = Math.random()
  let hp = 0
  let x = Math.random() * 700
  let y = Math.random() * 500
  let atkSpd = 0
  let owner = ""

  // console.log("spawning")
  upgradeList[id] = new Character(
    "upgrade",
    id,
    sizeX,
    sizeY,
    spdX,
    spdY,
    hp,
    x,
    y,
    atkSpd,
    owner
  )
  upgradeList[id].addChar()
}

const makeHouse = () => {
  let $houseDiv = $("<div class='house'>")
  $houseDiv.css({
    width: "100px",
    height: "120px",
    position: "absolute",
    top: "200px",
    left: "260px"
  })
  $gameBoard.append($houseDiv)
}

const house = {
  x: 260,
  y: 200,
  sizeX: 100,
  sizeY: 120
}

// unlimited spawn
const spawnEnemy = () => {
  let enemyFrequency = 800
  // setInterval(function spawn() {
  if (pause === false && gameCounter % enemyFrequency === 0) {
    // generateEnemy()
    generateEnemy()
    if (gameCounter > 1500) enemyFrequency = 400
    else if (gameCounter > 2500) enemyFrequency = 250
  }
}

const restartGame = () => {
  for (key in enemyList) {
    enemyList[key].removeChar()
  }
  for (key in bulletList) {
    bulletList[key].removeChar()
  }
  for (key in upgradeList) {
    upgradeList[key].removeChar()
  }
  for (key in petList) {
    petList[key].removeChar()
  }

  player.hp = 100
  enemyList = []
  bulletList = []
  upgradeList = []
  petList = []
  gameCounter = 0
  pause = true
  startGame()
  // requestAnimationFrame(update)
}

$(function() {
  $pauseBtn.on("click", togglePause)

  makeHouse()

  function togglePause() {
    if (player.hp <= 0) return
    if (pause === false) pause = true
    else {
      pause = false
      requestAnimationFrame(update)
    }
  }

  const startGame = () => {
    if (player.hp <= 0) return
    if (pause === true) {
      drawMap(1)
      player.addChar()
      generateUpgrade()
      // generateUpgrade()
      generateEnemy()

      generateCat()

      // generateCow()

      gameCounter = 0
      pause = false
      requestAnimationFrame(update)
    }
  }

  const restartGame = () => {
    for (key in enemyList) {
      enemyList[key].removeChar()
    }
    for (key in bulletList) {
      bulletList[key].removeChar()
    }
    for (key in upgradeList) {
      upgradeList[key].removeChar()
    }
    for (key in petList) {
      petList[key].removeChar()
    }

    player.hp = 100
    score = 0
    gameCounter = 0
    enemyList = []
    bulletList = []
    upgradeList = []
    petList = []
    startGame()
  }

  $startBtn.on("click", startGame) //starts the game
  $restartBtn.on("click", restartGame) //restarts the game

  for (cat in petList) {
    let catMeow = new Audio("/assets/audio/catMeow.mp3")
    if (petList[cat].type === "cat") {
      this.jTarget.on("click", catMeow.play())
    }
  }

  $body.on("mousedown", () => {
    player.isShooting = true
  })

  $body.on("mouseup", () => {
    player.isShooting = false
  })

  let intervalShootID = setInterval(() => {
    if (player.isShooting) {
      player.shoot()
    }
    // console.log("test") //to do: kill interval
  }, player.atkSpd)

  setInterval(() => {
    if (pause === false) {
      for (key in enemyList) {
        enemyList[key].shoot()
      }
    }
    //to do: clear interval after enemy delete
  }, 2000)

  const update = () => {
    if (pause === true) return
    gameCounter++ // keeps track of time spent in game 60 fps
    $score.text(`Score: ${Math.floor(score / 1)}`)
    player.moveChar()

    // spawnEnemy()
    //move enemies
    for (key in enemyList) {
      enemyList[key].moveChar()
      if (checkCollision(enemyList[key], player)) {
        player.hp-- //player takes damage on collision
        checkDead()
      }
      if (checkCollision(enemyList[key], house)) {
        //
        if (
          enemyList[key].x + enemyList[key].sizeX >= house.x &&
          enemyList[key].x <= house.x + house.sizeX
        )
          enemyList[key].spdX *= -1
        if (
          enemyList[key].y + enemyList[key].sizeY >= house.y &&
          enemyList[key].y <= house.y + house.sizeY
        ) {
          enemyList[key].spdY *= -1
        }
      }
    }

    for (key in petList) {
      petList[key].moveChar()
      if (checkCollision(petList[key], player) && petList[key].type === "cat") {
        catMeow.play()
        // console.log('Mr Scruffington says "Get off my lawn, pesky farmer!"')
      }
      if (checkCollision(petList[key], house)) {
        //
        if (
          petList[key].x + petList[key].sizeX >= house.x &&
          petList[key].x <= house.x + house.sizeX
        )
          petList[key].spdX *= -1
        if (
          petList[key].y + petList[key].sizeY >= house.y &&
          petList[key].y <= house.y + house.sizeY
        ) {
          petList[key].spdY *= -1
        }
      }
    }

    for (key in upgradeList) {
      upgradeList[key].moveChar()
      if (checkCollision(upgradeList[key], player)) {
        player.hp += 10 //player takes health on collision
        player.bulletMod++
        upgradeList[key].removeChar()
        upgradeList.splice(key, 1)
      }
    }
    //move bullets
    for (key in bulletList) {
      bulletList[key].moveChar()
      bulletList[key].timer++
      if (bulletList[key].timer > 150) {
        bulletList[key].removeChar()
        bulletList.splice(key, 1)
        continue
      }
      //bullet collision with player
      if (
        checkCollision(player, bulletList[key]) &&
        bulletList[key].bulletOwner === "enemy"
      ) {
        // console.log("player hit!")
        player.hp -= 5

        player.jTarget.css({
          filter: "grayscale(1)"
        })
        setTimeout(function() {
          player.jTarget.css({
            filter: "none"
          })
        }, 200)
        checkDead()

        bulletList[key].removeChar()
        bulletList.splice(key, 1)
        continue
      }
      //bullet collision with enemy
      for (enemy in enemyList) {
        if (
          checkCollision(enemyList[enemy], bulletList[key]) &&
          bulletList[key].bulletOwner === "player"
        ) {
          enemyList[enemy].hp -= 50
          enemyList[enemy].jTarget.css({
            filter: "grayscale(1)"
          })
          setTimeout(function() {
            if (enemyList[enemy]) {
              enemyList[enemy].jTarget.css({
                filter: "none"
              })
            }
          }, 200)
          if (bulletList[key].x < enemyList[enemy].x) {
            enemyList[enemy].x += 10
          } else enemyList[enemy].x -= 10
          if (bulletList[key].y < enemyList[enemy].y + enemyList[enemy].sizeY) {
            enemyList[enemy].y -= 10
          } else enemyList[enemy].y -= 10
          if (enemyList[enemy].hp <= 0) {
            score += 10
            enemyList[enemy].removeChar()
            enemyList.splice(enemy, 1)
          }
          bulletList[key].removeChar()
          bulletList.splice(key, 1) //might have to be added to removeChar method
          break
        }
      }
      //bullet collision with house
      for (key in bulletList) {
        if (checkCollision(bulletList[key], house)) {
          bulletList[key].removeChar()
          bulletList.splice(key, 1)
        }
      }
    }

    $hitpoint.text(`HP: ${player.hp}`)
    if (pause === false) requestAnimationFrame(update)
  }

  //setInterval(update, 30)
  //60 fps
  requestAnimationFrame(update)
})

const loseScreen = () => {
  let $deadText = $('<h1 class="deadText">')
  let $deadScore = $('<h1 class="deadScore">')
  $deadText.text(`You have died. Score: ${score}`)
  // $deadScore.text(`Score: ${score}`)

  $deadText.css({
    position: "absolute"
  })

  $deadScore.css({
    position: "absolute"
  })

  $loseDiv.append($deadText)
  $loseDiv.append($deadScore)
  $loseDiv.css({
    color: "white",
    // margin: "0 auto",
    display: "flex",
    "justify-content": "center",
    "align-items": "center",
    height: "400px"
    // background: "rgba(255, 255, 255, 0.5)"
  })

  $gameBoard.append($loseDiv)

  $gameBoard.css({
    filter: "grayscale(1)"
  })
}

const drawMap = level => {
  if (level === 1) {
    $gameBoard.css({
      background: `url("/assets/images/spring.png")`,
      display: "flex",
      "justify-content": "center",
      "align-items": "center",
      filter: "none"
    })
  }
  $loseDiv.empty()
  $loseDiv.remove()
}

const checkCollision = (obj1, obj2) =>
  obj1.x <= obj2.x + obj2.sizeX &&
  obj2.x <= obj1.x + obj1.sizeX &&
  obj1.y <= obj2.y + obj2.sizeY &&
  obj2.y <= obj1.y + obj1.sizeY

const checkDead = () => {
  if (player.hp <= 0) {
    pause = true
    loseScreen()
  }
}
