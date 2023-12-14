import './App.css';
import { useRef, useEffect, useState } from 'react';

const loadMemory = (program) =>{
  let newMemory = Array.from({ length: 16 }, () => 0)
  if(program=="Increment"){
    newMemory[0] = '00100011101111011111111111111100'
    newMemory[1] = '10001111101010010000000000000000'
    newMemory[2] = '00100001001010010000000000000001'
    newMemory[3] = '10101111101010010000000000000000'
    newMemory[4] = '00100011101111010000000000000100'
    newMemory[5] = '00001000000000000000000000000000'
  }
  return newMemory
}

function App() {
  const [memory, setMemory] = useState(loadMemory("Increment"))
  const [registers, setRegisters] = useState({zero:{number:0, value:0}, t0:{number:8, value:0}, t1:{number:9, value:0}, t2:{number:10, value:0}, t3:{number:11, value:0}, s0:{number: 16, value:0}, s1:{number: 17, value:0}, s2:{number: 18, value:0}
  ,gp: {number: 28, value:0},sp: {number: 29, value:64},fp: {number: 30, value:0},ra: {number: 31, value:0}
  })
  const [data, setData] = useState([
    {PC: 0},
    {currentInstruction:0},
    {currentInstruction:0, readData1:0, readData2:0, PC:0},
    {currentInstruction:0, PC:0, BRANCHALU:0, MEMALU:0, readData2:0},
    {readData:0, MEMALU:0}
    ])
  const [clockRunning, setClockRunning] = useState(false)
  const [clockSpeed, setClockSpeed] = useState(1)
  const [control, setControl] = useState({RegDst: 0, Jump : 0, Branch : 0, MemRead : 0, MemtoReg : 0, ALUOP: '00', MemWrite : 0, ALUSrc : 0, RegWrite : 0, Zero: 0})
  const [step, setStep] = useState(0)
  const [tab, setTab] = useState("CPU")
  const [memoryTab, setMemoryTab] = useState("Memory")
  const [program, setProgram] = useState("Increment")
  const canvasRef = useRef(null);


  useEffect(() => {

    let increment;
    if (clockRunning) {
      // Start the clock
      increment = setInterval(() => {
        setStep((prevStep)=>prevStep+1)

      }, 1/clockSpeed*1000);
    }

    // Cleanup function to clear the interval when the component unmounts or is no longer running
    return () => {
      clearInterval(increment);
    };
  }, [clockRunning]); // Run effect whenever isRunning changes

  const incrementProgram = 
  `
  Increment:
    # Get first address from stack pointer
    addi $sp, $sp, -4

    # Load value, increment, and store value
    lw $t1, 0($sp)
    addi $t1, $t1, 1
    sw $t1, 0($sp)

    # Deallocate space on the stack
    addi $sp, $sp, 4

    # Loop back to start of program
    j 0
  `
  const fibonacciProgram =
  `
  Fibonacci:
  
  `
 

  function drawLine(ctx, x1, y1, x2, y2, color) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  function drawTriangle(context, x, y, color) {
    context.fillStyle = color
  
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x - 8, y - 4); 
    context.lineTo(x - 8, y + 4); 
    context.closePath();
    context.fill();
  }
  function drawBottomTriangle(context, x, y, color){
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x - 4, y - 8); 
    context.lineTo(x + 4, y - 8); 
    context.closePath();
    context.fillStyle = color;
    context.fill();
  }
  function drawTopTriangle(context, x, y, color){
    context.fillStyle = color
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x - 4, y + 8);
    context.lineTo(x + 4, y + 8);
    context.closePath();
    context.fill();
  }
  function drawLeftTriangle(context, x, y, color){
    context.fillStyle = color
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + 8, y - 4);
    context.lineTo(x + 8, y + 4);
    context.closePath();
    context.fill();
  }
  const drawPC = (ctx, x, y, value) =>{
    const pcWidth = 80;
    const pcHeight = 40;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.strokeRect(x, y, pcWidth, pcHeight);
    const textX = x + pcWidth / 2 - 10;
    const textY = y + pcHeight / 2-3; 
    ctx.fillStyle = "black";
    ctx.font = `18px Arial`;
    ctx.fillText("PC", textX, textY);
    ctx.fillText(value.toString(2).padStart(6, "0"), textX-20, textY+18);
  }
  const drawALU = (ctx, x, y, mode) => {
    drawLine(ctx, x,y,x+60,y+40)
    drawLine(ctx, x+60,y+40,x+60,y+80)
    drawLine(ctx, x+60,y+80,x,y+120)
    drawLine(ctx, x,y+120,x,y+90)
    drawLine(ctx, x,y+120,x,y+80)
    drawLine(ctx, x,y+80,x+15,y+60)
    drawLine(ctx, x+15,y+60,x,y+40)
    drawLine(ctx, x,y+40,x,y)
    ctx.fillStyle = "black";
    ctx.font = `18px Arial`;
    ctx.fillText("ALU", x+20, y+60);
    ctx.font = `20px Arial`;
    ctx.fillText(mode, x+32, y+78);
  }
  const drawPCtoALU = (ctx, PCX, PCY, ALUX, ALUY, color)=>{
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PCX+80, PCY+20);
    ctx.lineTo(PCX+100, PCY+20);
    ctx.lineTo(PCX+100, ALUY+20);
    ctx.lineTo(ALUX, ALUY+20);
    ctx.stroke();
    drawTriangle(ctx, ALUX, ALUY+20, color)

  }
  const drawPCALU4 = (ctx, PCALUX, PCALUY) =>{
    drawLine(ctx, PCALUX-20, PCALUY+100, PCALUX, PCALUY+100)
    ctx.font = `18px Arial`;
    ctx.fillStyle = "black";
    ctx.fillText("4", PCALUX-35, PCALUY+105);
    drawTriangle(ctx ,PCALUX, PCALUY+100, "black")

  }
  const drawALUtoPC = (ctx, PCX, PCY, ALUX, ALUY, color)=>{
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ALUX+60, ALUY+60)
    ctx.lineTo(ALUX+80, ALUY+60)
    ctx.lineTo(ALUX+80, ALUY-10)
    ctx.lineTo(PCX-20, ALUY-10)
    ctx.lineTo(PCX-20, PCY+20)
    ctx.lineTo(PCX, PCY+20)
    ctx.stroke();
    drawTriangle(ctx, PCX, PCY+20, color)
  }
  const drawIM = (ctx, x, y, value) =>{
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 190, 100)
    ctx.fillStyle = "black";
    ctx.font = `20px Arial`;
    ctx.fillText("Instruction Memory", x+12, y+53);
    ctx.font = `16px Arial`;
    ctx.fillText("Read Address", x+40, y+25);
    ctx.font = `15px "Courier New", monospace`;
    ctx.fillText(value.toString().substring(32-0, 32-16).padStart(16, "0"), x+25, y+87)
    ctx.fillText(value.toString().substring(32-16, 32-32).padStart(16, "0"), x+25, y+72)
  }
  const drawPCtoIM=(ctx, PCX, PCY, IMX, IMY, color)=>{
    ctx.strokeStyle = color
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PCX+80, PCY+21)
    ctx.lineTo(PCX+100, PCY+21)
    ctx.lineTo(IMX+100, IMY)
    ctx.stroke();
    drawBottomTriangle(ctx, IMX+100, IMY, color)
  }
  const drawIMtoRAM=(ctx, IMX, IMY, PC, color)=>{
    const RAMY = 564-PC*8.22
    const RAMX = 1240
    ctx.strokeStyle = color
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(IMX, IMY+10)
    ctx.lineTo(IMX-20, IMY+10)
    ctx.lineTo(IMX-20, 564)
    ctx.lineTo(IMX, 564)
    ctx.lineTo(1190, 564);
    ctx.stroke();

    if(color=="red"&&memoryTab=="Memory"){
      ctx.strokeStyle = color
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(1190, 564)

      ctx.lineTo(1220, 564)
      ctx.lineTo(1220, RAMY)
      ctx.lineTo(RAMX, RAMY)
      ctx.stroke();
    }
    
    ctx.strokeStyle = color
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(1190, 555);
    ctx.lineTo(IMX+100, 555)
    ctx.lineTo(IMX+100, 555)
    ctx.lineTo(IMX+100, IMY+100)
    ctx.stroke();
    if(color=="red"&&memoryTab=="Memory"){
      ctx.strokeStyle = color
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(RAMX, RAMY-9)
      ctx.lineTo(1213, RAMY-9)
      ctx.lineTo(1213, 555)
      ctx.lineTo(1190, 555)
      ctx.stroke();
    }

    drawTopTriangle(ctx, IMX+100, IMY+100)
    
  }
  const drawRegister = (ctx, x, y) =>{
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 180, 220)
    ctx.fillStyle = "black";
    ctx.font = `20px Arial`;
    ctx.fillText("Registers", x+50, y+23)
    ctx.font = `16px Arial`;
    ctx.fillText("Read register 1", x+5, y+50)
    ctx.fillText("Read data 1", x+90, y+70)
    ctx.fillText("Read register 2", x+5, y+110)
    ctx.fillText("Read data 2", x+90, y+130)
    ctx.fillText("Write register", x+5, y+160)
    ctx.fillText("Write data", x+5, y+205)
  }
  const drawIMtoRegister = (ctx, IMX, IMY, RegX, RegY, currentInstruction, color) => {
    const instructionString = currentInstruction.toString().padStart(32, "0")
    ctx.strokeStyle = color
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(IMX+190, IMY+50)
    ctx.lineTo(IMX+210, IMY+50)
    ctx.moveTo(IMX+210, RegY-65)
    ctx.lineTo(IMX+210, RegY+170)
    ctx.moveTo(IMX+210, RegY+45)
    ctx.lineTo(RegX, RegY+45)
    ctx.moveTo(IMX+210, RegY+105)
    ctx.lineTo(RegX, RegY+105)
    ctx.moveTo(IMX+210, RegY+170)
    ctx.lineTo(RegX-30, RegY+170)
    ctx.moveTo(RegX-50, RegY+105)
    ctx.lineTo(RegX-50, RegY+140)
    ctx.lineTo(RegX-30, RegY+140)
    ctx.moveTo(RegX-10, RegY+155)
    ctx.lineTo(RegX, RegY+155);
    ctx.moveTo(IMX+210, RegY-65)
    ctx.lineTo(RegX-10, RegY-65)

    ctx.stroke()

    drawTriangle(ctx, RegX, RegY+155,color)
    drawTriangle(ctx, RegX, RegY+105,color)
    drawTriangle(ctx, RegX, RegY+45,color)
    drawTriangle(ctx, RegX-10, RegY-65,color)
    
    ctx.fillStyle = "black";
    ctx.font = `15px Arial`;
    ctx.fillText(instructionString.substring(32-26, 32-32)+"[31-26]", RegX-120, RegY-40)

    ctx.fillText(instructionString.substring(32-21, 32-26)+"[25-21]", RegX-120, RegY+40)
    ctx.fillText(instructionString.substring(32-16, 32-21)+"[20-16]", RegX-120, RegY+100)
    ctx.fillText(instructionString.substring(32-11, 32-16)+"[15-11]", RegX-120, RegY+165)

  }
  const drawMux = (ctx, RegX, RegY, input) =>{
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2;
    ctx.beginPath();
    const radius = 10
    ctx.arc(RegX-30 + radius, RegY+135, radius, Math.PI , 0);
    ctx.lineTo(RegX-10, RegY+175);
    ctx.arc(RegX-30 + radius, RegY+175, radius, 0, Math.PI);
    ctx.lineTo(RegX-30, RegY+135);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = input==0?"red":"black";
    ctx.font = `18px Arial`;
    ctx.fillText("0", RegX-25, RegY+145)
    ctx.fillStyle = input==1?"red":"black";
    ctx.font = `18px Arial`;
    ctx.fillText("1", RegX-25, RegY+175)
  }
  const drawInverseMux = (ctx, RegX, RegY, input) =>{
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2;
    ctx.beginPath();
    const radius = 10
    ctx.arc(RegX-30 + radius, RegY+135, radius, Math.PI , 0);
    ctx.lineTo(RegX-10, RegY+175);
    ctx.arc(RegX-30 + radius, RegY+175, radius, 0, Math.PI);
    ctx.lineTo(RegX-30, RegY+135);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = input==0?"red":"black";
    ctx.font = `18px Arial`;
    ctx.fillText("0", RegX-25, RegY+175)
    ctx.fillStyle = input==1?"red":"black";
    ctx.font = `18px Arial`;
    ctx.fillText("1", RegX-25, RegY+145)
  }
  const drawSignExtend = (ctx, x, y) =>{
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x+60, y+15, 60, 20, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.font = `18px Arial`;
    ctx.fillText("Sign extend", x+12, y+21)
  }
  const drawIMtoSignExtend = (ctx, IMX, IMY, SignX, SignY, currentInstruction, color) =>{
    const instructionString = currentInstruction.toString().padStart(32, "0")
    ctx.strokeStyle = color
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(IMX+210, IMY+50)
    ctx.lineTo(IMX+210, SignY+15)
    ctx.lineTo(SignX, SignY+15)
    ctx.stroke()
    ctx.fillStyle = "black";
    ctx.font = `15px Arial`;
    ctx.fillText("[15-0]", IMX+255, SignY+10)
  }
  const drawREGALU = (ctx, x, y) => {
    drawLine(ctx, x,y,x+80,y+20)
    drawLine(ctx, x+80,y+20,x+80,y+100)
    drawLine(ctx, x+80,y+100,x,y+120)
    drawLine(ctx, x,y+120,x,y+90)
    drawLine(ctx, x,y+120,x,y+80)
    drawLine(ctx, x,y+80,x+15,y+60)
    drawLine(ctx, x+15,y+60,x,y+40)
    drawLine(ctx, x,y+40,x,y)
    ctx.fillStyle = "black";
    ctx.font = `18px Arial`;
    ctx.fillText("ALU", x+20, y+58);
    ctx.font = `20px Arial`;
    const ALUOperation = getALUOperation()
    ctx.fillText(ALUOperation, x+32, y+75);
    ctx.font = '15px Arial';
    ctx.fillText("Result", x+33, y+93);
  }
  const drawSL2 = (ctx, x, y) =>{
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x+32, y+15, 30, 30, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.font = `18px Arial`;
    ctx.fillText("Shift", x+12, y+11)
    ctx.fillText("left 2", x+12, y+31)
  }
  const drawMemory = (ctx, x, y) =>{
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 140, 150)
    ctx.fillStyle = "black";
    ctx.font = `20px Arial`;
    ctx.fillText("Memory", x+35, y+40)
    ctx.font = `16px Arial`;
    ctx.fillText("Address", x+5, y+65)
    ctx.fillText("Read data", x+63, y+85)
    ctx.fillText("Write data", x+5, y+135)
  }
  const drawExLines = (ctx, ALUX, ALUY, SignX, SignY, RegX, RegY, ALUMUXX, ALUMUXY, REGALUX, REGALUY, SL2X, SL2Y, branchALUX, branchALUY, branchMUXX,branchMUXY, IMX, IMY, ALUCX, ALUCY,  color) =>{
    ctx.strokeStyle = color
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(RegX+180, RegY+65)
    ctx.lineTo(REGALUX, RegY+65)
    ctx.moveTo(RegX+195, RegY+125)
    ctx.lineTo(ALUMUXX-30, RegY+125)
    ctx.moveTo(ALUMUXX-10, REGALUY+105)
    ctx.lineTo(REGALUX, REGALUY+105)
    ctx.moveTo(SignX+121, SignY+15)
    ctx.lineTo(SL2X+25, SignY+15)
    ctx.lineTo(SL2X+25, SL2Y+45)
    ctx.moveTo(SL2X+63, SL2Y+15)
    ctx.lineTo(branchALUX, SL2Y+15)
    ctx.moveTo(SL2X+25, ALUMUXY+170)
    ctx.lineTo(ALUMUXX-30, ALUMUXY+170)
    ctx.moveTo(branchALUX-50, branchALUY+20)
    ctx.lineTo(branchALUX, branchALUY+20)
    ctx.moveTo(IMX+200, IMY+50)
    ctx.lineTo(IMX+200, IMY+225)
    ctx.lineTo(ALUCX-25, IMY+225)

    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = color
    ctx.arc(SL2X+25, ALUMUXY+170, 4, 0, 2 * Math.PI, false);
    ctx.fill()
    ctx.closePath();
    drawTriangle(ctx, REGALUX, RegY+65, color)
    drawTriangle(ctx, REGALUX, REGALUY+105, color)
    drawTriangle(ctx, branchALUX, SL2Y+15, color)
    drawTriangle(ctx, branchALUX, branchALUY+20, color)
    ctx.fillStyle = "black";
    ctx.font = `15px Arial`;
    ctx.fillText("[5-0]", IMX+255, ALUCY+20)
  }
  const drawExMemLines = (ctx, PCALUX, PCALUY, branchALUX, branchALUY, RegX, RegY, color) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PCALUX+60, PCALUY+60)
    ctx.lineTo(branchALUX-50, PCALUY+60)
    ctx.lineTo(branchALUX-50, branchALUY+20)
    ctx.moveTo(RegX+180, RegY+125)
    ctx.lineTo(RegX+195, RegY+125)
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = color
    ctx.arc(branchALUX-50, branchALUY+20, 4, 0, 2 * Math.PI, false);
    ctx.arc(RegX+195, RegY+125, 4, 0, 2 * Math.PI, false);
    ctx.fill()
    ctx.closePath();
  }
  const drawIMMemLines = (ctx, IMX, IMY, color) =>{
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(IMX+190, IMY+50)
    ctx.lineTo(IMX+200, IMY+50)
    ctx.stroke();
    ctx.arc(IMX+200, IMY+50, 4, 0, 2 * Math.PI, false);
    ctx.fill()
    ctx.closePath();
  }
  const drawMemLines = (ctx, branchALUX, branchALUY, REGALUX, REGALUY, branchMUXX, branchMUXY, jumpMuxX, jumpMuxY, RegX, RegY, memoryX, memoryY, jumpSL2X, jumpSL2Y, IMX, IMY, PCX, PCY, color) =>{
    ctx.strokeStyle = color
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(branchALUX-50, branchALUY+20)
    ctx.lineTo(branchALUX-50, branchALUY-10)
    ctx.lineTo(branchMUXX-60, branchALUY-10)
    ctx.lineTo(branchMUXX-60, branchMUXY+140)
    ctx.lineTo(branchMUXX-30, branchMUXY+140)
    ctx.moveTo(branchALUX+60, branchALUY+55)
    ctx.lineTo(branchMUXX-30, branchALUY+55)
    ctx.moveTo(branchMUXX-10, branchMUXY+150)
    ctx.lineTo(jumpMuxX-30, branchMUXY+150)
    ctx.moveTo(RegX+195, RegY+125)
    ctx.lineTo(RegX+195, RegY+200)
    ctx.lineTo(memoryX-20, RegY+200)
    ctx.lineTo(memoryX-20, memoryY+130)
    ctx.lineTo(memoryX, memoryY+130)
    ctx.moveTo(REGALUX+110, REGALUY+90)
    ctx.lineTo(memoryX, REGALUY+90)
    ctx.moveTo(IMX+200, IMY+50)
    ctx.lineTo(IMX+200, jumpSL2Y+130)
    ctx.lineTo(jumpSL2X-100, jumpSL2Y+130)
    ctx.lineTo(jumpSL2X-100, jumpSL2Y+15)
    ctx.lineTo(jumpSL2X+3, jumpSL2Y+15)
    ctx.moveTo(jumpSL2X+60, jumpSL2Y+15)
    ctx.lineTo(jumpSL2X+150, jumpSL2Y+15)
    ctx.lineTo(jumpSL2X+150, jumpSL2Y-15)
    ctx.lineTo(jumpMuxX-50, jumpSL2Y-15)
    ctx.lineTo(jumpMuxX-50, jumpMuxY+140)
    ctx.lineTo(jumpMuxX-30, jumpMuxY+140)
    ctx.moveTo(jumpMuxX-10, jumpMuxY+155)
    ctx.lineTo(jumpMuxX+20, jumpMuxY+155)
    ctx.lineTo(jumpMuxX+20, jumpMuxY+105)
    ctx.lineTo(jumpMuxX+20, jumpMuxY+105)
    ctx.lineTo(PCX-20, jumpMuxY+105)
    ctx.lineTo(PCX-20, PCY+20)
    ctx.lineTo(PCX, PCY+20)
    ctx.stroke();
    ctx.closePath();


    const RAMY = 564-data[3].MEMALU*8.22
    const RAMX = 1240
    const writeColor = (step%5==3&&(control.MemWrite||control.MemRead))?"red":"black"
    ctx.strokeStyle = writeColor
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(memoryX+140, memoryY+40)
    ctx.lineTo(1190, memoryY+40)
    if(memoryTab=="Memory"&&writeColor=="red"){
      ctx.lineTo(1210, memoryY+40)
      ctx.lineTo(1210, RAMY)
      ctx.lineTo(RAMX, RAMY)

    }
    ctx.stroke();
    ctx.closePath();

    if(memoryTab=="Memory"&&writeColor=="red"){
      drawTriangle(ctx, RAMX+1, RAMY, writeColor)
    }
    
    const readColor = (step%5==3&&(control.MemRead))?"red":"black"
    ctx.strokeStyle = readColor
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(memoryX+140, memoryY+30)
    ctx.lineTo(1190, memoryY+30)
    if(memoryTab=="Memory"&&readColor=="red"){
      ctx.lineTo(1200, memoryY+30)
      ctx.lineTo(1200, RAMY-10)
      ctx.lineTo(RAMX, RAMY-10)
    }
    ctx.stroke();
    ctx.closePath();

    drawLeftTriangle(ctx,memoryX+140, memoryY+30, readColor)
    drawTriangle(ctx, memoryX, memoryY+60, color)
    drawTriangle(ctx, memoryX, memoryY+130, color)
    drawTriangle(ctx, PCX, PCY+20, color)
    ctx.fillStyle = "black"
    ctx.font = `16px Arial`;
    ctx.fillText("[25-0]", jumpSL2X-50, jumpSL2Y+10)
  }
  const drawMemWBLines = (ctx,REGALUX, REGALUY, color) =>{
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(REGALUX+80, REGALUY+90)
    ctx.lineTo(REGALUX+110, REGALUY+90)
    ctx.stroke();
    ctx.arc(REGALUX+110, REGALUY+90, 4, 0, 2 * Math.PI, false);
    ctx.fill()
    ctx.closePath();
  }
  const drawWBLines = (ctx, RegX , RegY, REGALUX, REGALUY, memoryX, memoryY, memoryMuxX, memoryMuxY, color) =>{
    ctx.strokeStyle = color
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(REGALUX+110, REGALUY+90)
    ctx.lineTo(REGALUX+110, REGALUY+210)
    ctx.lineTo(memoryMuxX-60, REGALUY+210)
    ctx.lineTo(memoryMuxX-60, memoryMuxY+170)
    ctx.lineTo(memoryMuxX-30, memoryMuxY+170)
    ctx.moveTo(memoryX+140, memoryY+80)
    ctx.lineTo(memoryMuxX-30, memoryY+80)
    ctx.moveTo(memoryMuxX-10, memoryMuxY+155)
    ctx.lineTo(memoryMuxX+20, memoryMuxY+155)
    ctx.lineTo(memoryMuxX+20, memoryMuxY+290)
    ctx.lineTo(RegX-30, memoryMuxY+290)
    ctx.lineTo(RegX-30, RegY+200)
    ctx.lineTo(RegX, RegY+200)
    ctx.stroke();
    ctx.closePath();
    drawTriangle(ctx, RegX, RegY+200, color)

  }
  const drawControl = (ctx, controlX, controlY, ALUCX, ALUCY) => {
    ctx.strokeStyle = "DeepSkyBlue"
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ALUCX, ALUCY, 35, 0, 2 * Math.PI, false);
    ctx.moveTo(controlX, controlY)
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.ellipse(controlX, controlY, 35, 70, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = "DeepSkyBlue"
    ctx.font = '14px Arial'
    ctx.fillText(control.ALUOP, ALUCX-8, ALUCY-21)
    const ALUInput = getALUInputCode()
    ctx.fillText(ALUInput, ALUCX+37, ALUCY+14)

    ctx.font = '16px Arial'
    ctx.fillText("ALU", ALUCX-15, ALUCY-2)
    ctx.fillText("Control", ALUCX-25, ALUCY+15)
    ctx.fillText("Control", controlX-27, controlY+5)
  }
  const drawControlLines = (ctx, control, controlX, controlY, RegX, RegY) =>{
    ctx.strokeStyle = control.RegDst?"DeepSkyBlue":"Gray"
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(controlX-27, controlY-45)
    ctx.lineTo(controlX-110, controlY-45)
    ctx.lineTo(controlX-110, controlY+3)
    ctx.lineTo(controlX-155, controlY+3)
    ctx.lineTo(controlX-155, RegY+193)
    ctx.lineTo(RegX-20, RegY+193)
    ctx.lineTo(RegX-20, RegY+185)
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = control.RegDst?"DeepSkyBlue":"Gray"
    ctx.font = '14px Arial'
    ctx.fillText("RegDst", controlX-75, controlY-49)

    ctx.strokeStyle = control.Jump?"DeepSkyBlue":"Gray"
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(controlX+18, controlY-60)
    ctx.lineTo(controlX+70, controlY-60)
    ctx.lineTo(controlX+150, controlY-60)
    ctx.lineTo(controlX+150, controlY-155)
    ctx.lineTo(controlX+510, controlY-155)
    ctx.lineTo(controlX+510, controlY-140)
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = control.Jump?"DeepSkyBlue":"Gray"
    ctx.font = '14px Arial'
    ctx.fillText("Jump", controlX+40, controlY-63)

    ctx.strokeStyle = control.Branch?"DeepSkyBlue":"Gray"
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(controlX+28, controlY-42)
    ctx.lineTo(controlX+70, controlY-42)
    ctx.lineTo(controlX+155, controlY-42)
    ctx.lineTo(controlX+155, controlY+5)
    ctx.lineTo(controlX+355, controlY+5)
    ctx.lineTo(controlX+355, controlY+5)
    ctx.lineTo(controlX+355, controlY-30)
    ctx.lineTo(controlX+395, controlY-30)
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = control.Branch?"DeepSkyBlue":"Gray"
    ctx.font = '14px Arial'
    ctx.fillText("Branch", controlX+40, controlY-45)
    

    ctx.strokeStyle = control.Zero?"DeepSkyBlue":"Gray"
    ctx.lineWidth = 2;
    ctx.beginPath();    
    ctx.moveTo(controlX+340, controlY+145)
    ctx.lineTo(controlX+375, controlY+145)
    ctx.lineTo(controlX+375, controlY-10)
    ctx.lineTo(controlX+395, controlY-10)
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = control.Zero?"DeepSkyBlue":"Gray"
    ctx.font = '14px Arial'
    ctx.fillText("Zero", controlX+305, controlY+150)

    ctx.strokeStyle = (control.Zero&&control.Branch)?"DeepSkyBlue":"Gray"
    ctx.lineWidth = 2;
    ctx.beginPath();    
    ctx.moveTo(controlX+405, controlY-40)
    ctx.lineTo(controlX+395, controlY-40)
    ctx.lineTo(controlX+395, controlY)
    ctx.lineTo(controlX+405, controlY)
    ctx.moveTo(controlX+405, controlY-40)
    ctx.arc(controlX+405, controlY-20, 20, -Math.PI/2, Math.PI/2)
    ctx.moveTo(controlX+425, controlY-20)
    ctx.lineTo(controlX+460, controlY-20)
    ctx.lineTo(controlX+460, controlY-60)

    ctx.stroke();
    ctx.closePath();

    ctx.strokeStyle = control.MemRead?"DeepSkyBlue":"Gray"
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(controlX+32, controlY-24)
    ctx.lineTo(controlX+140, controlY-24)
    ctx.lineTo(controlX+140, controlY+20)
    ctx.lineTo(controlX+560, controlY+20)
    ctx.lineTo(controlX+560, controlY+145)
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = control.MemRead?"DeepSkyBlue":"Gray"
    ctx.font = '14px Arial'
    ctx.fillText("MemRead", controlX+40, controlY-27)
    ctx.fillText("MemRead", controlX+523, controlY+160)

    ctx.strokeStyle = control.MemtoReg?"DeepSkyBlue":"Gray"
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(controlX+35, controlY-6)
    ctx.lineTo(controlX+120, controlY-6)
    ctx.lineTo(controlX+120, controlY+35)
    ctx.lineTo(controlX+660, controlY+35)
    ctx.lineTo(controlX+660, controlY+210)
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = control.MemtoReg?"DeepSkyBlue":"Gray"
    ctx.font = '14px Arial'
    ctx.fillText("MemtoReg", controlX+40, controlY-9)

    ctx.strokeStyle = "DeepSkyBlue"
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(controlX+35, controlY+12)
    ctx.lineTo(controlX+240, controlY+12)
    ctx.lineTo(controlX+240, controlY+300)
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = "DeepSkyBlue"
    ctx.font = '14px Arial'
    ctx.fillText("ALUOp", controlX+40, controlY+7)

    ctx.strokeStyle = control.MemWrite?"DeepSkyBlue":"Gray"
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(controlX+32, controlY+30)
    ctx.lineTo(controlX+110, controlY+30)
    ctx.lineTo(controlX+110, controlY+65)
    ctx.lineTo(controlX+480, controlY+65)
    ctx.lineTo(controlX+480, controlY+145)
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = control.MemWrite?"DeepSkyBlue":"Gray"
    ctx.font = '14px Arial'
    ctx.fillText("MemWrite", controlX+40, controlY+27)
    ctx.fillText("MemWrite", controlX+455, controlY+160)

    ctx.strokeStyle = control.ALUSrc?"DeepSkyBlue":"Gray"
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(controlX+24, controlY+48)
    ctx.lineTo(controlX+220, controlY+48)
    ctx.lineTo(controlX+220, controlY+190)
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = control.ALUSrc?"DeepSkyBlue":"Gray"
    ctx.font = '14px Arial'
    ctx.fillText("ALUSrc", controlX+40, controlY+45)
    
    ctx.strokeStyle = control.RegWrite?"DeepSkyBlue":"Gray"
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(controlX+12, controlY+66)
    ctx.lineTo(controlX+70, controlY+66)
    ctx.lineTo(controlX+70, RegY)
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = control.RegWrite?"DeepSkyBlue":"Gray"
    ctx.font = '14px Arial'
    ctx.fillText("RegWrite", controlX+40, controlY+63)
  }
  const drawALUctoALU = (ctx, ALUCX, ALUCY, REGALUX, REGALUY) =>{
    ctx.strokeStyle = "DeepSkyBlue"
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ALUCX+35, ALUCY)
    ctx.lineTo(ALUCX+60, ALUCY)
    ctx.lineTo(ALUCX+60, REGALUY+110)

    ctx.stroke();
    ctx.closePath();
  }
  useEffect(() =>{
    let newData = [...data]
    const newStep = step
    console.log(newStep)
    //IF data to set: data[1]:{currentInstruction:0},

    if(newStep%5==0){

      //const newPC = newData[0].PC==15*4?0:newData[0].PC+4
      //newData[0].PC = newPC
      newData[0].currentInstruction = memory[newData[0].PC/4]
      setData(newData)
    }
    //ID data to set: data[2]:{currentInstruction:0, readData1:0, readData2:0, PC:0}, data[3]:PC
    if(newStep%5==1){
      newData[1].currentInstruction = newData[0].currentInstruction

      const currentInstruction = newData[1].currentInstruction
      const instructionString = currentInstruction.toString().padStart(32, "0")

      const register1 = Object.values(registers).find(register=>register.number==parseInt(instructionString.substring(32-21, 32-26),2))
      const register2 = Object.values(registers).find(register=>register.number==parseInt(instructionString.substring(32-16, 32-21),2))
      newData[2].currentInstruction = currentInstruction
      newData[2].readData1 = register1?register1.value:0
      newData[2].readData2 = register2?register2.value:0
      newData[2].PC = newData[0].PC+4
      newData[3].PC = newData[0].PC+4

      setData(newData)
      const opCode = instructionString.substring(32-26, 32-32)
      let newControl = {...control}
      //addi
      if(opCode == '001000'){
        newControl.RegDst= 0 
        newControl.Jump = 0
        newControl.Branch = 0
        newControl.MemRead = 0
        newControl.MemtoReg = 0
        newControl.ALUOP = '00'
        newControl.MemWrite = 0
        newControl.ALUSrc = 1
        newControl.RegWrite = 1
      }
      //lw
      else if(opCode =='100011'){
        newControl.RegDst= 0 
        newControl.Jump = 0
        newControl.Branch = 0
        newControl.MemRead = 1
        newControl.MemtoReg = 1
        newControl.ALUOP = '00'
        newControl.MemWrite = 0
        newControl.ALUSrc = 1
        newControl.RegWrite = 0
      }
      //sw
      else if(opCode =='101011'){
        newControl.RegDst= 0 
        newControl.Jump = 0
        newControl.Branch = 0
        newControl.MemRead = 0
        newControl.MemtoReg = 0
        newControl.ALUOP = '00'
        newControl.MemWrite = 1
        newControl.ALUSrc = 1
        newControl.RegWrite = 0
      }
      //jump
      else if(opCode =='000010'){
        newControl.RegDst= 0 
        newControl.Jump = 1
        newControl.Branch = 0
        newControl.MemRead = 0
        newControl.MemtoReg = 0
        newControl.ALUOP = '00'
        newControl.MemWrite = 0
        newControl.ALUSrc = 0
        newControl.RegWrite = 0
      }
      setControl(newControl)
    }
    //EX: data to set data[3]: {currentInstruction:0, BRANCHALU:0, MEMALU:0, readData2:0},
    if(newStep%5==2){
      const currentInstruction = newData[2].currentInstruction
      const instructionString = currentInstruction.toString().padStart(32, "0")

      newData[3].currentInstruction = currentInstruction
      newData[3].BRANCHALU = newData[2].PC + parseInt(instructionString.substring(32-0, 32-16),2)*4
      if(getALUOperation()=="+"){

        const immediateField = instructionString.substring(32-0, 32-16)
        let immediateNumber = parseInt(immediateField,2)
        if (immediateField[0] === '1') {
          immediateNumber = parseInt(immediateField, 2) - Math.pow(2, immediateField.length);
        }
        const input1 = newData[2].readData1
        const input2 = control.ALUSrc?immediateNumber:newData[2].readData2
        newData[3].MEMALU = input1 + input2

      }
      else if(getALUOperation()=="-"){
        newData[3].MEMALU = newData[2].readData1 - control.ALUSrc?parseInt(instructionString.substring(32-0, 32-16),2):newData[2].readData2
      }
      newData[3].readData2 = newData[2].readData2
      newData[4].MEMALU = newData[3].MEMALU
      setData(newData)
    }
    //MEM data to set: data[4]: {readData:0}, data[0]:{currentInstruction}

    if(newStep%5==3){
      const memoryIndex = newData[3].MEMALU/4
      const newMemory = [...memory]
      if(control.MemRead){
        newData[4].readData = newMemory[memoryIndex]
      }
      if(control.MemWrite){

        newMemory[memoryIndex] = newData[3].readData2.toString(2)

      }
      const branchMUXval = (control.Zero&&control.Branch)?newData[3].BRANCHALU:newData[3].PC
      const jumpMUXval = control.Jump?parseInt(newData[3].currentInstruction.toString(2).substring(32-0, 32-26),2)*4:branchMUXval
      newData[0].PC = jumpMUXval
      setData(newData)
      setMemory(newMemory)
    }
    //WB data to set: register
    if(newStep%5==4){
      const currentInstruction = newData[1].currentInstruction

      const instructionString = currentInstruction.toString().padStart(32, "0")

      if(control.RegWrite){
        const writeRegisterAddress = parseInt(control.RegDst?instructionString.substring(32-11, 32-16):instructionString.substring(32-16, 32-21),2)

        const writeRegister = Object.values(registers).find(register=>register.number==writeRegisterAddress)
        if(writeRegister){
          writeRegister.value=control.MemtoReg?newData[4].readData:newData[4].MEMALU
        }
      }
    }
  },[step])

  const getALUInputCode = () =>{
    if(control.ALUOP=="00"){
      return '0010'
    }
    if(control.ALUOP=="01"){
      return '0110'
    }
  }
  const getALUOperation = () =>{
    const ALUInputCode = getALUInputCode();
    if(ALUInputCode=="0010"){
      return "+"
    }
    if(ALUInputCode=="0110"){
      return "-"
    }
  }
  function toSigned32BitBinary(number) {
    const absoluteBinary = Math.abs(number).toString(2);
  
    const paddedBinary = '0'.repeat(32 - absoluteBinary.length) + absoluteBinary;
  
    const invertedBinary = paddedBinary.split('').map(bit => (bit === '0' ? '1' : '0')).join('');
  
    const result = (parseInt(invertedBinary, 2) + 1).toString(2);
  
    return result;
  }
  useEffect(() => {
    if(tab=="CPU"){
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const PCX = 40
      const PCY = 200
      const PCALUX = 200
      const PCALUY = 30
      const IMX = 40
      const IMY = 300
      const RegX = 375
      const RegY = 240
      const SignX = 400
      const SignY = 480
      const ALUMUXX = 640
      const ALUMUXY = 230
      const REGALUX = 660
      const REGALUY = 280
      const SL2X = 565
      const SL2Y = 115
      const branchALUX = 670
      const branchALUY = 35
      const branchMUXX = 880
      const branchMUXY = -80
      const jumpMuxX = 930
      const jumpMuxY = -100
      const memoryX = 850
      const memoryY = 310
      const memoryMuxX = 1080
      const memoryMuxY = 250
      const jumpSL2X = 380
      const jumpSL2Y = 30
      const ALUCX = 640
      const ALUCY = 500
      const controlX = 400
      const controlY = 165
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawControl(context, controlX, controlY, ALUCX, ALUCY)
      drawControlLines(context, control, controlX, controlY, RegX, RegY)
      drawALUctoALU(context, ALUCX, ALUCY, REGALUX, REGALUY)

      drawPC(context, PCX, PCY, data[0].PC)
      drawALU(context, PCALUX, PCALUY, "+");
      drawPCtoALU(context, PCX, PCY, PCALUX, PCALUY, step%5==0?"red":"black")
      drawPCALU4(context, PCALUX, PCALUY)
      //drawALUtoPC(context, PCX, PCY, PCALUX, PCALUY, step%5==0?"red":"black")
      drawIM(context, IMX, IMY, data[0].currentInstruction)
      drawPCtoIM(context, PCX, PCY, IMX, IMY, step%5==0?"red":"black")
      drawIMtoRAM(context, IMX, IMY, data[0].PC, step%5==0?"red":"black")
      drawRegister(context, RegX, RegY)
      drawIMtoRegister(context, IMX, IMY, RegX, RegY, data[1].currentInstruction, step%5==1?"red":"black")
      drawMux(context, RegX, RegY, control.RegDst)
      drawSignExtend(context, SignX, SignY)
      drawIMtoSignExtend(context, IMX, IMY, SignX, SignY, data[1].currentInstruction, step%5==1?"red":"black")
      drawMux(context, ALUMUXX, ALUMUXY, control.ALUSrc)
      drawREGALU(context, REGALUX, REGALUY);
      drawSL2(context, SL2X, SL2Y)
      drawALU(context, branchALUX, branchALUY, "+")
      drawMux(context, branchMUXX, branchMUXY, control.Branch&&control.Zero)
      drawInverseMux(context, jumpMuxX, jumpMuxY, control.Jump)
      drawMemory(context, memoryX, memoryY)
      drawInverseMux(context, memoryMuxX, memoryMuxY, control.MemtoReg)

      drawSL2(context, jumpSL2X, jumpSL2Y)

      drawExLines(context, PCALUX, PCALUY, SignX, SignY, RegX, RegY, ALUMUXX, ALUMUXY, REGALUX, REGALUY, SL2X, SL2Y, branchALUX, branchALUY, branchMUXX,branchMUXY, IMX, IMY , ALUCX, ALUCY, step%5==2?"red":"black")
      drawIMMemLines(context, IMX, IMY, (step%5==1||step%5==2||step%5==3)?"red":"black")
      drawExMemLines(context, PCALUX, PCALUY, branchALUX, branchALUY, RegX, RegY, (step%5==2||step%5==3)?"red":"black")
      drawMemLines(context, branchALUX, branchALUY, REGALUX, REGALUY, branchMUXX, branchMUXY, jumpMuxX, jumpMuxY, RegX, RegY, memoryX, memoryY, jumpSL2X, jumpSL2Y, IMX, IMY, PCX, PCY, step%5==3?"red":"black")
      drawMemWBLines(context, REGALUX, REGALUY, (step%5==3||step%5==4)?"red":"black")
      drawWBLines(context, RegX , RegY, REGALUX, REGALUY, memoryX, memoryY, memoryMuxX, memoryMuxY, (step%5==4)?"red":"black")
      
      
    }
  },[step, tab, data, memoryTab, memory]);
  
  const addressArray = Array.from({ length: memory.length }, (_, index) => (memory.length-1)*4 - index * 4);
  const steps = ["IF", "ID", "EX", "MEM", "WB"]
  const stepParts = [
    ["Read the instruction from the memory location pointed to by the PC", "Load the instruction into the Instruction Memory (IM)"],
    ["Use the opcode [31-26] to determine the control signals for the instruction", "Read values from registers as needed"],
    ["Calculate addresses for memory operations", "Perform ALU (Arithmetic Logic Unit) operations"],
    ["Read or write data to or from memory", "Either increment, branch, or jump the Program Counter (PC)"],
    ["Write the result of the operation back to the register file"]
  ]
  return(
    <>
      <div className='bg-blue-500 px-20 py-2 flex justify-between'>
        <p className='text-white text-3xl font-semibold'>CPU Simulation</p>
        <a href='https://adamgerhant.github.io/portfolio' className='text-white text-3xl hover:underline'>Adam Gerhant</a>
      </div>
      <div className='flex flex-col mt-8 mx-20 '>
        <div className=' border border-black   flex'>
            <div className='w-[40%] border-r border-black  flex flex-col'>      
              <div className='flex items-baseline'>
                <p className='mt-1 ml-2 text-2xl'>About</p>
              </div>        
              <p className='mx-2'>Simulation of the circuitry within a basic non pipelined MIPS CPU described in the textbook: Computer Organization and Design: The Hardware/Software Interface
              </p>
            </div>
            <div className='w-[60%] border-black flex'>
              <div className='flex flex-col '>
                <p className=" px-2 text-2xl mt-1 w-[70px] flex flex-col justify-center cursor-pointer"></p>
                <div className='flex mt-2'>
                  <div className='ml-2 flex flex-col items-center'>
                    <div className='flex mb-2'>
                      <p className='text-xl '>Clock speed: </p>
                      <select value={clockSpeed} onChange={(e)=>setClockSpeed(e.target.value)} className="border border-gray-500 ml-2 rounded" id="numberDropdown">
                        <option value="1">1 Hz</option>
                        <option value="5">5 Hz</option>
                        <option value="10">10 Hz</option>
                        <option value="50">50 Hz</option>

                      </select>
                    </div>
                    {!clockRunning&&<div className='border border-amber-500 border-2 bg-yellow-300 text-lg font-semibold pb-[1px] text-center w-[100px] cursor-pointer' onClick={()=>{setClockRunning(true)}}>Start Clock</div>}
                    {clockRunning&&<div className='border border-red-500 border-2 bg-red-300 text-lg font-semibold pb-[1px] text-center w-[100px] cursor-pointer' onClick={()=>{setClockRunning(false)}}>Stop Clock</div>}

                  </div>
                  
                  <div className='flex flex-col justify-center items-center shrink-0 w-[155px]'>
                    <p className='text-xl pb-2'>Step:{step} ({steps[step%5]})</p>
                    {!clockRunning&&<div className='border border-amber-500 border-2 bg-yellow-300 text-lg font-semibold pb-[1px] text-center w-[100px] cursor-pointer' onClick={()=>{setStep(prevStep=>prevStep+1)}}>Next step</div>}
                    {clockRunning&&<div className='border border-gray-500 border-2 bg-gray-300 text-lg font-semibold pb-[1px] text-center w-[100px] cursor-pointer'>Next step</div>}

                  </div>
                </div>
                
                
              </div>
              
              <>
                
                <div className='py-1 flex-grow h-[105px]'>
                    <div className='font-semibold text-lg '>Microinstructions</div>
                    {stepParts[step % 5].map((stepPart, index) => (
                      <div key={index} className='py-1'>
                        {stepPart}
                      </div>
                    ))}
                </div>
              </>

            </div>
        </div>
        <div className='flex-1 flex flex-row'> 
          <div className='overflow-hidden w-[1240px] flex-shrink-0 mt-10 relative'>

            <div className='w-[1190px] h-[625px] border border-black absolute z-1 top-0'/>
            <div className='absolute z-2 top-[1px] left-[1px] w-[1188px]'>
              <div className='flex w-full'>
              <div onClick={()=>setTab("CPU")} className={`${tab=="CPU"?"bg-slate-100":""} py-1 text-2xl border-b border-black w-1/2 text-center cursor-pointer border-r`}>CPU</div>
              <div onClick={()=>setTab("Assembly")} className={`${tab=="Assembly"?"bg-slate-100":""} py-1 top-[1px] left-[1px] text-2xl border-b border-black  w-1/2 text-center cursor-pointer`}>Assembly Editor</div>
              </div>    
            </div>
          
            {tab=="CPU"&&<canvas className="mt-[50px]" ref={canvasRef} width={1240} height={585} />}

            {tab=="Assembly"&&
              <div className='absolute z-2 mt-20 mr-14 ml-10 flex h-[510px]'>
                <div>
                  <p className='text-xl'>Select sample program</p>
                  <div className='flex text-xl border-x border-t border-black w-[400px]'>
                    <div onClick={()=>setProgram("Increment")} className={`${program=="Increment"&&"bg-gray-100"} text-lg px-3 flex-1 text-center border-r border-black cursor-pointer`}>Increment</div>
                    <div onClick={()=>setProgram("Fibonacci")} className={`${program=="Fibonacci"&&"bg-gray-100"} text-lg px-3 flex-1 text-center cursor-pointer `}>Fibonacci</div>
                  </div>
                  {program=="Increment"&&<textarea readOnly className='border border-black h-[400px] w-[400px]'>{incrementProgram}</textarea>}
                  {program=="Fibonacci"&&<textarea readOnly className='border border-black h-[400px] w-[400px]'>{fibonacciProgram}</textarea>}
                </div>
                <div className='ml-5 h-full bg-gray'>
                  <p className='text-xl'>Machine code translation</p>
                  <div className='flex border-y border-l border-black w-[700px]'>
                      <div className='text border-r border-black text-center w-[80px]'>Name</div>
                      <div className='text border-r border-black text-center w-[60px]'>Format</div>
                      <div className='text border-r border-black text-center flex-grow'>Machine code</div>
                  </div>
                  <div className='flex border-b border-l border-black w-[700px]'>
                      <div className='text border-r border-black text-center w-[80px]'>R-format</div>
                      <div className='text border-r border-black text-center w-[60px]'>R</div>
                      <div className='text border-r border-black text-center w-[70px]'>Opcode</div>
                      <div className='text border-r border-black text-center w-[80px]'>Source (rs)</div>
                      <div className='text border-r border-black text-center w-[80px]'>Target (rt)</div>
                      <div className='text border-r border-black text-center w-[113px]'>Destination (rd)</div>

                      <div className='text border-r border-black text-center w-[105px]'>Shift amount</div>
                      <div className='text border-r border-black text-center flex-grow'>Function code</div>
                  </div>
                  <div className='flex border-b border-l border-black w-[700px]'>
                      <div className='text border-r border-black text-center w-[80px]'>I-format</div>
                      <div className='text border-r border-black text-center w-[60px]'>I</div>
                      <div className='text border-r border-black text-center w-[70px]'>Opcode</div>
                      <div className='text border-r border-black text-center w-[80px]'>Source (st)</div>
                      <div className='text border-r border-black text-center w-[80px]'>Target (rt)</div>
                      <div className='text border-r border-black text-center flex-grow'>Address/Value</div>
                  </div>
                  <div className='flex border-b border-l border-black w-[700px]'>
                      <div className='text border-r border-black text-center w-[80px]'>J-format</div>
                      <div className='text border-r border-black text-center w-[60px]'>J</div>
                      <div className='text border-r border-black text-center w-[70px]'>Opcode</div>
                      <div className='text border-r border-black text-center flex-grow'>Address</div>
                  </div>
                  {program=="Increment"&&
                  <div className='overflow-y-scroll h-[295px] mt-8'>
                    <div className='border-t border-black'>
                      <div className='flex border-b border-l border-black w-[700px]'>
                        <div className='text border-r border-black text-center w-[80px]'>addi</div>
                        <div className='text border-r border-black text-center w-[60px]'>I</div>
                        <div className='text border-r border-black text-center w-[70px]'>001000</div>
                        <div className='text border-r border-black text-center w-[80px]'>11101</div>
                        <div className='text border-r border-black text-center w-[80px]'>11101</div>
                        <div className='text border-r border-black text-center flex-grow'>1111111111111100</div>
                      </div>
                      <div className='flex border-b border-l border-black w-[700px]'>
                        <div className='text border-r border-black text-center w-[80px]'>lw</div>
                        <div className='text border-r border-black text-center w-[60px]'>I</div>
                        <div className='text border-r border-black text-center w-[70px]'>100011</div>
                        <div className='text border-r border-black text-center w-[80px]'>11101</div>
                        <div className='text border-r border-black text-center w-[80px]'>01001</div>
                        <div className='text border-r border-black text-center flex-grow'>0000000000000000</div>
                      </div>
                      <div className='flex border-b border-l border-black w-[700px]'>
                        <div className='text border-r border-black text-center w-[80px]'>addi</div>
                        <div className='text border-r border-black text-center w-[60px]'>I</div>
                        <div className='text border-r border-black text-center w-[70px]'>001000</div>
                        <div className='text border-r border-black text-center w-[80px]'>01001</div>
                        <div className='text border-r border-black text-center w-[80px]'>01001</div>
                        <div className='text border-r border-black text-center flex-grow'>0000000000000001</div>
                      </div>
                      <div className='flex border-b border-l border-black w-[700px]'>
                        <div className='text border-r border-black text-center w-[80px]'>sw</div>
                        <div className='text border-r border-black text-center w-[60px]'>I</div>
                        <div className='text border-r border-black text-center w-[70px]'>101011</div>
                        <div className='text border-r border-black text-center w-[80px]'>11101</div>
                        <div className='text border-r border-black text-center w-[80px]'>01001</div>
                        <div className='text border-r border-black text-center flex-grow'>0000000000000000</div>
                      </div>
                      <div className='flex border-b border-l border-black w-[700px]'>
                        <div className='text border-r border-black text-center w-[80px]'>addi</div>
                        <div className='text border-r border-black text-center w-[60px]'>I</div>
                        <div className='text border-r border-black text-center w-[70px]'>001000</div>
                        <div className='text border-r border-black text-center w-[80px]'>11101</div>
                        <div className='text border-r border-black text-center w-[80px]'>11101</div>
                        <div className='text border-r border-black text-center flex-grow'>0000000000000100</div>
                      </div>
                      <div className='flex border-b border-l border-black w-[700px]'>
                        <div className='text border-r border-black text-center w-[80px]'>j</div>
                        <div className='text border-r border-black text-center w-[60px]'>J</div>
                        <div className='text border-r border-black text-center w-[70px]'>000010</div>
                        <div className='text border-r border-black text-center flex-grow'>0000000000000000</div>
                      </div>
                    </div>
                  </div>
                  }
                  <div onClick={()=>loadMemory(program)}className='absolute right-[250px] bottom-[0px] py-1 w-[200px] text-center border-amber-500 border-2 bg-yellow-300 text-lg font-semibold cursor-pointer'>
                    Load to memory
                  </div>
                </div>
                
              </div>
              
            }
          </div>

          <div className='border border-black mt-10 h-[627px] flex-grow'>
            <div className='flex border-b border-black'>
              <div onClick={()=>setMemoryTab("Memory")} className={`${memoryTab=="Memory"?"bg-gray-100":"" } flex flex-col py-1 flex-1 cursor-pointer border-r border-black`}>
                <p className='text-2xl  text-center'>Memory</p>
              </div>
              <div onClick={()=>setMemoryTab("Registers")} className={`${memoryTab=="Registers"?"bg-gray-100":"" } flex flex-col py-1 flex-1 cursor-pointer border-r border-black`}>
                <p className='text-2xl  text-center'>Registers</p>
              </div>
              <div onClick={()=>setMemoryTab("Datapath")} className={`${memoryTab=="Datapath"?"bg-gray-100":"" } flex flex-col py-1 flex-1 cursor-pointer border-black`}>
                <p className='text-2xl  text-center'>Datapath</p>
              </div>
            </div>
            {memoryTab=="Memory"&&
            <>
              <p className='text text-gray-700 pl-2 pt-1'>Each row is a 32 bit word</p>
              <div className='flex'>
                <div className='w-[80px]'>
                  <div className='text-lg text-center  border-black'>Address</div>
                  {addressArray.map((value, index)=>(
                    <div key={index} className={`${value==data[0].PC&&step%5==0?"text-[#f00]":""} border-t border-black py-1 px-1 text-center`}>
                      {value.toString(2).padStart(6, '0')}

                    </div>
                  ))

                  }
                </div>
                <div className='w-[360px]'>
                  <div className='text-lg  border-black text-center'>Binary</div>
                  {memory.slice().reverse().map((value, index)=>(
                    <div key={index} className={`${memory.length-index-1==data[0].PC/4&&step%5==0?"text-[#f00]":""} border-t border-black py-1 px-1 text-center [letter-spacing:theme(spacing[0.5])]`}>
                      {String(value).padStart(32, '0')}
                    </div>
                  ))
                  }
                </div>
                <div className='flex-grow'>
                  <div className='text-lg border-black text-center'>Decimal</div>
                  {memory.slice().reverse().map((value, index)=>{
                    return(
                    <div key={index} className={`${memory.length-index-1==data[0].PC/4&&step%5==0?"text-[#f00]":""} border-t border-black py-1 px-1 text-center`}>
                      {parseInt(value, 2)>10000?">10000":parseInt(value, 2)}
                    </div>
                  )})
                  }
                </div>
              </div> 
            </>
            }
            {memoryTab=="Registers"&&
            <>
              <p className='text text-gray-700 pl-2 pt-1'>Only a subset of all MIPS registers are implemented</p>
              <div className="flex"> 
                  <p className='w-[50px] text-[17px] border-black text-center border-b border-black'>Name</p>
                  <p className='w-[65px] text-[17px] border-black text-center border-b border-black'>Address</p>

                  <p className='w-[330px] text-[17px] border-black text-center border-b border-black'>Binary</p>
                  <p className='flex-grow text-[17px] border-black text-center border-b border-black'>Decimal</p>
              </div>
              {Object.keys(registers).map((registerName, index)=>(
                <div className='flex ' key={index}>
                  <p className='w-[50px] border-b border-black py-1 px-1 text-center '>${registerName}</p>
                  <p className='w-[65px] border-b border-black py-1 px-1 text-left '>{registers[registerName].number.toString(2).padStart(5, "0")}</p>

                  <p className='w-[330px] border-b border-black py-1 px-1 text-center [letter-spacing:theme(spacing[0.5])]'>{registers[registerName].value.toString(2).padStart(32, "0")}</p>
                  <p className='flex-grow border-b border-black py-1 px-1 text-center '>{registers[registerName].value>1000?">10000":registers[registerName].value}</p>
                </div>
              ))}
            </>  
            } 
            {memoryTab=="Datapath"&&
            <div className='text-[15px]'>
            
              <div className='flex items-center py-1 border-b border-black'>
                <div className=' text-center flex flex-col justify-center w-[170px] shrink-0'>
                  <p className='text-xl'>IF</p>
                  <p className='text'>Instruction Fetch</p>
                </div>
                <div className=''>
                  <div className='flex-grow'>
                    <p>Program Counter</p>
                    <p className='mt-[-5px] [letter-spacing:theme(spacing[0.5])]'>{data[0].PC.toString(2).padStart(6, "0")}</p>
                  </div>
                  <div className='flex-grow'>
                    <p>Current Instruction</p>
                    <p className='mt-[-5px] [letter-spacing:theme(spacing[0.5])]'>{data[0].currentInstruction.toString(2).padStart(32, "0")}</p>
                  </div>
                </div> 
              </div>
              <div className='flex items-center py-1 border-b border-black'>
                <div className=' text-center flex flex-col justify-center w-[170px] shrink-0'>
                  <p className='text-xl'>ID</p>
                  <p className='text'>Instruction Decode</p>
                </div>
                <div className=''>
                  <div className='flex-grow'>
                    <p>Current Instruction</p>
                    <p className='mt-[-5px] [letter-spacing:theme(spacing[0.5])]'>{data[1].currentInstruction.toString(2).padStart(32, "0")}</p>
                  </div>
                </div> 
              </div>
              <div className='flex items-center py-1 border-b border-black'>
                <div className=' text-center flex flex-col justify-center w-[170px] shrink-0'>
                  <p className='text-xl'>EX</p>
                  <p className='text'>Excecute</p>
                </div>
                <div className=''>

                  <div className='flex-grow'>
                    <p>Current Instruction</p>
                    <p className='mt-[-5px] [letter-spacing:theme(spacing[0.5])]'>{data[2].currentInstruction.toString(2).padStart(32, "0")}</p>
                  </div>
                  <div className='flex-grow'>
                    <p>Read Data 1</p>
                    <p className='mt-[-5px] [letter-spacing:theme(spacing[0.5])]'>{data[2].readData1.toString(2).padStart(32, "0")}</p>
                  </div>
                  <div className='flex-grow'>
                    <p>Read Data 2</p>
                    <p className='mt-[-5px] [letter-spacing:theme(spacing[0.5])]'>{data[2].readData2.toString(2).padStart(32, "0")}</p>
                  </div>
                </div> 
              </div>
              <div className='flex items-center py-1 border-b border-black'>
                <div className=' text-center flex flex-col justify-center w-[170px] shrink-0'>
                  <p className='text-xl'>MEM</p>
                  <p className='text'>Memory</p>
                </div>
                <div className=''>
                  <div className='flex-grow'>
                    <p>Current Instruction</p>
                    <p className='mt-[-5px] [letter-spacing:theme(spacing[0.5])]'>{data[3].currentInstruction.toString(2).padStart(32, "0")}</p>
                  </div>
                  <div className='flex-grow'>
                    <p>Branch ALU Output</p>
                    <p className='mt-[-5px] [letter-spacing:theme(spacing[0.5])]'>{data[3].BRANCHALU.toString(2).padStart(32, "0")}</p>
                  </div>
                  <div className='flex-grow'>
                    <p>Memory ALU Output</p>
                    <p className='mt-[-5px] [letter-spacing:theme(spacing[0.5])]'>{data[3].MEMALU.toString(2).padStart(32, "0")}</p>
                  </div>
                  <div className='flex-grow'>
                    <p>Read Data 2</p>
                    <p className='mt-[-5px] [letter-spacing:theme(spacing[0.5])]'>{data[3].readData2.toString(2).padStart(32, "0")}</p>
                  </div>
                  
                </div> 
              </div>
              <div className='flex items-center py-1 border-b border-black'>
                <div className=' text-center flex flex-col justify-center w-[170px] shrink-0'>
                  <p className='text-xl'>WB</p>
                  <p className='text'>Write back</p>
                </div>
                <div className=''>
                  <div className='flex-grow'>
                    <p>Read Data</p>
                    <p className='mt-[-5px] [letter-spacing:theme(spacing[0.5])]'>{data[4].readData.toString(2).padStart(32, "0")}</p>
                  </div>             
                </div> 
              </div>
            </div>
            }
          </div>
        </div>
      </div>
    </>
    
  )
  
  
}

export default App;
