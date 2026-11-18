autowatch=1;
inlets=1;
outlets=1;
mgraphics.init();
mgraphics.relative_coords=0;
mgraphics.autofill=0;
var caption=jsarguments[1];
function onclick(){outlet(0,'bang');}
function paint(){
 var g=mgraphics,r=box.getattr('presentation_rect'),w=r[2],h=r[3];
 if(caption==='reset'){
  var x=w/2,y=h/2;g.set_source_rgba(0.58,0.58,0.58,1);g.set_line_width(1.15);g.arc(x,y,4.6,0.65,5.35);g.stroke();
  g.move_to(x+5.5,y-2.7);g.line_to(x+5.1,y+1.5);g.line_to(x+1.8,y-0.9);g.close_path();g.fill();
 }else if(caption==='dice'){ 
  var size=10,x=(w-size)/2,y=(h-size)/2;
  g.set_source_rgba(1,0.61,0.22,1);g.set_line_width(1);g.rectangle(x,y,size,size);g.stroke();
  var dots=[[2.5,2.5],[7.5,2.5],[5,5],[2.5,7.5],[7.5,7.5]];
  for(var i=0;i<dots.length;i++){g.ellipse(x+dots[i][0]-0.8,y+dots[i][1]-0.8,1.6,1.6);g.fill();}
 }else{
  g.set_source_rgba(0.18,0.18,0.18,1);g.rectangle(0,0,w,h);g.fill();
  g.select_font_face('Arial');g.set_font_size(9);g.set_source_rgba(0.85,0.85,0.85,1);
  var metrics=g.text_measure(caption);g.move_to((w-metrics[0])/2,(h+metrics[1])/2-1);g.show_text(caption);
 }
}
