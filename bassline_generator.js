autowatch=1;
inlets=2;
outlets=2;
include("chord_progressions.js");
var context={},settings={progressionMode:0,preset:0,start:0,type:0,density:100,register:2,humanize:0,length:100,offset:0,segments:4};
var result=new Dict(),parameterChange=false,phraseSeed=1,manualPreset=false;
function dictionary(name){if(inlet===1)context=JSON.parse(new Dict(name).stringify());else bang();}
function density(v){if(isFinite(v)){settings.density=Math.max(0,Math.min(100,Math.round(v)));parameterChange=true;}}
function offset(v){if(isFinite(v)){settings.offset=Math.max(0,Math.min(100,Math.round(v)));parameterChange=true;}}
function segments(v){if(isFinite(v)){settings.segments=Math.max(1,Math.min(16,Math.round(v)));parameterChange=true;}}
function length(v){if(isFinite(v)){settings.length=Math.max(1,Math.min(100,Math.round(v)));parameterChange=true;}}
function humanize(v){if(isFinite(v)){settings.humanize=Math.max(0,Math.min(100,Math.round(v)));parameterChange=true;}}
function register(v){if(isFinite(v)){settings.register=Math.max(0,Math.min(8,Math.round(v)));parameterChange=true;}}
function reset(){manualPreset=false;this.patcher.getnamed("resetbutton").message("hidden",1);settings.progressionMode=1;settings.preset=Math.floor(Math.random()*progressionBank.length);phraseSeed=Math.floor(Math.random()*2147483646)+1;parameterChange=true;}
function type(v){if(isFinite(v)){settings.type=Math.max(0,Math.min(2,Math.round(v)));parameterChange=true;}}
function start(v){if(isFinite(v)){settings.start=Math.max(0,Math.min(7,Math.round(v)));parameterChange=true;}}
function preset(v){if(isFinite(v)){if(visiblePage)manualPreset=true;settings.progressionMode=1;settings.preset=Math.max(0,Math.min(progressionBank.length-1,Math.round(v)));parameterChange=true;if(searchMatches)this.patcher.getnamed("browse").message("set",searchMatches.indexOf(settings.preset));}}
var generatorPage=["rootlabel","rootdisplayselect","typelabel","type","density","densitycaption","densityreadout","register","registercaption","registerreadout","humanize","humanizecaption","offset","offsetlabel","segments","segmentslabel","length","lengthlabel","progressionbutton","resetbutton"],progressionPage=["browse","chordcount","searchplaceholder","searchinput","backbutton","shufflebutton","tile0","tile1","tile2","tile3","tile4","tile5","tile6","tile7","tile8","tile9"];
var tileChoices=[], searchQuery="", searchMatches=null, visiblePage=0, beforeSearchTiles=null, filterCount=4;
function roman(index) { return progressionBank[index].name.split(' / ')[1].split(' - ')[0]; }
function chordcount(v) {
    if(!isFinite(v)) return;
    var count=Math.max(1,Math.min(32,Math.round(v)));
    if(count===filterCount) return;
    var query=searchQuery;
    filterCount=count; searchMatches=null; searchQuery=''; tileChoices=[];beforeSearchTiles=null;
    search.call(this);
    if(query) search.call(this,query);
}
function matchescount(index) {return roman(index).split(/\s+/).length===filterCount;}
function search() {
    var query=arrayfromargs(arguments).join(' ').replace(/^\s+|\s+$/g,'').replace(/\s+/g,' ').toLowerCase();
    if(query==='bang' || query==='""') query='';
    if(query===searchQuery && searchMatches!==null) {placeholder.call(this);return;}
    if(!searchQuery && query) beforeSearchTiles=tileChoices.slice();
    var restoring=searchQuery && !query && beforeSearchTiles!==null;
    searchQuery=query;
    searchMatches=[];
    var menu=this.patcher.getnamed('browse');menu.message('clear');
    for(var i=0;i<progressionBank.length;i++) if(matchescount(i) && (!searchQuery || (' '+roman(i).toLowerCase()+' ').indexOf(' '+searchQuery+' ')>=0)) searchMatches.push(i);
    if(searchQuery) searchMatches.sort(function(a,b) {
        var aa=roman(a).toLowerCase(),bb=roman(b).toLowerCase();
        return (aa===searchQuery?0:1)-(bb===searchQuery?0:1) || aa.length-bb.length || a-b;
    });
    for(i=0;i<searchMatches.length;i++) menu.message('append',roman(searchMatches[i]));
    if(!searchMatches.length) menu.message('append','No matches');
    menu.message('set',searchMatches.indexOf(settings.preset));
    if(restoring) {tileChoices=beforeSearchTiles;beforeSearchTiles=null;rendertiles.call(this);} else shuffle.call(this, true);
    placeholder.call(this);
}
function placeholder() {
    this.patcher.getnamed('searchplaceholder').message('hidden',!visiblePage || searchQuery ? 1:0);
    if(visiblePage && !searchQuery) this.patcher.message('script','bringtofront','searchplaceholder');
}
function browse(v) {
    var index=Math.round(v);
    if(searchMatches && index>=0 && index<searchMatches.length) this.patcher.getnamed('preset').message('int',searchMatches[index]);
}
function tilevisibility() {
    for(var i=0;i<10;i++) this.patcher.getnamed('tile'+i).message('hidden',!visiblePage || i>=tileChoices.length ? 1:0);
}
function shuffle(ordered) {
    var available=[],seen={};
    var candidates=searchMatches || progressionBank.map(function(e,i){return i;});
    for(var k=0;k<candidates.length;k++) {
        var i=candidates[k], name=roman(i);
        // Long formulas remain available in the top selector; grid buttons fit short formulas.
        if(matchescount(i) && (name.length<=17 || (searchQuery && name.toLowerCase()===searchQuery)) && !seen[name]) { available.push(i);seen[name]=true; }
    }
    if(!ordered) for(i=available.length-1;i>0;i--) { var j=Math.floor(Math.random()*(i+1)),tmp=available[i];available[i]=available[j];available[j]=tmp; }
    tileChoices=available.slice(0,10);
    rendertiles.call(this);
}
function rendertiles() {
    for(var i=0;i<tileChoices.length;i++) {
        var button=this.patcher.getnamed('tile'+i),title=roman(tileChoices[i]);
        button.message('text',title);button.message('texton',title);
        this.patcher.getnamed('tile'+i+'pick').message('set',tileChoices[i]);
    }
    tilevisibility.call(this);
}

function page(v) {
    visiblePage=v?1:0;
    if(v && searchMatches===null) search.call(this);
    if(v && !tileChoices.length) shuffle.call(this);
    for(var i=0;i<generatorPage.length;i++) this.patcher.getnamed(generatorPage[i]).message('hidden',visiblePage||(generatorPage[i]==='resetbutton'&&!manualPreset));
    for(var j=0;j<progressionPage.length;j++) this.patcher.getnamed(progressionPage[j]).message('hidden',1-visiblePage);
    tilevisibility.call(this);
    placeholder.call(this);
}
function generate(){
    var c=context,clip=c.clip||{},scale=c.scale||{};
    var start=Number(clip.time_selection_start),end=Number(clip.time_selection_end);
    if(!isFinite(start)||!isFinite(end)||end<=start){start=Number(clip.loop_start);end=Number(clip.loop_end);}
    if(!isFinite(start)||!isFinite(end)||end<=start)return [];
    var intervals=(scale.scale_intervals||[]).map(Number).filter(function(v){return isFinite(v)&&v>=0&&v<12;});
    if(!intervals.length||settings.density<=0)return [];
    var root=Number(scale.root_note)||0,state=phraseSeed||1;
    function random(){state=state*16807%2147483647;return (state-1)/2147483646;}
    var startDegree=settings.start===7?Math.floor(random()*intervals.length):settings.start;
    var chords=[],entry=settings.progressionMode?progressionBank[settings.preset]:null;
    if(entry){
        for(var i=0;i<entry.notes.length;i++){
            var n=entry.notes[i];
            if(!chords.length||chords[chords.length-1].at!==n[1])chords.push({at:n[1],pitch:n[0]});
        }
    }
    function pitchAt(time){
        var degree=startDegree,base;
        base=12+settings.register*12+root+intervals[degree%intervals.length]+12*Math.floor(degree/intervals.length);
        if(entry&&chords.length){
            var pos=(time-start)/(end-start)*entry.length,j=0;
            while(j<chords.length-1&&chords[j+1].at<=pos)j++;
            var target=base+chords[j].pitch-chords[0].pitch,best=base,distance=Infinity;
            for(var p=0;p<=127;p++)if(intervals.indexOf(((p-root)%12+12)%12)>=0){var d=Math.abs(p-target);if(d<distance){distance=d;best=p;}}
            return best;
        }
        return Math.max(0,Math.min(127,base));
    }
    var notes=[],time=start,span=end-start,gridInterval=Number((c.grid||{}).interval);if(!isFinite(gridInterval)||gridInterval<=0)gridInterval=0.25;
    function clippedDuration(at,duration){
        var limit=end;
        if(entry&&chords.length){var pos=(at-start)/span*entry.length,j=0;while(j<chords.length-1&&chords[j+1].at<=pos)j++;if(j+1<chords.length)limit=Math.min(limit,start+chords[j+1].at/entry.length*span-gridInterval*settings.offset/100);}
        return Math.max(0,Math.min(duration,limit-at));
    }
    if(settings.type>0){
        var grid=gridInterval,secondPitches={},straightMotif=settings.type===2?[0,Math.floor(random()*7),Math.floor(random()*7),Math.floor(random()*7)]:[0,0,0,0];
        var stepIndex=0,gridTime=start,segmentLength=span/settings.segments;
        while(gridTime<end-1e-8){
            var base=pitchAt(gridTime),pitch=base,chordIndex=0,chordStart=start;
            if(settings.type===1){chordIndex=Math.min(settings.segments-1,Math.floor((gridTime-start)/segmentLength));chordStart=start+chordIndex*segmentLength;base=pitchAt(chordStart);pitch=base;}
            else if(entry&&chords.length){var chordPos=(gridTime-start)/span*entry.length;while(chordIndex<chords.length-1&&chords[chordIndex+1].at<=chordPos)chordIndex++;chordStart=start+chords[chordIndex].at/entry.length*span;}
            var chordStep=settings.type===1?stepIndex-Math.ceil((chordStart-start-1e-8)/grid):Math.floor((gridTime-chordStart+1e-8)/grid);
            if(settings.type===1&&chordStep%2){
                if(secondPitches[chordIndex]===undefined){var candidates=[],baseDegree=intervals.indexOf(((base-root)%12+12)%12),baseOctave=Math.floor((base-root)/12),baseScaleIndex=baseOctave*intervals.length+baseDegree;for(var candidate=base+1;candidate<=Math.min(127,base+24);candidate++){var candidateDegree=intervals.indexOf(((candidate-root)%12+12)%12);if(candidateDegree>=0){var candidateScaleIndex=Math.floor((candidate-root)/12)*intervals.length+candidateDegree;if(candidateScaleIndex-baseScaleIndex>=2)candidates.push(candidate);}}secondPitches[chordIndex]=candidates.length?candidates[Math.floor(random()*candidates.length)]:base;}
                pitch=secondPitches[chordIndex];
            }else if(settings.type===2){
                var degree=startDegree+straightMotif[stepIndex%4];
                pitch=12+settings.register*12+root+intervals[degree%intervals.length]+12*Math.floor(degree/intervals.length);
            }
            if(random()*100<settings.density){var duration=clippedDuration(gridTime,grid*settings.length/100);if(duration>0)notes.push({pitch:pitch,start_time:gridTime,duration:duration,velocity:stepIndex%4===0?104:88});}
            gridTime+=grid;stepIndex++;
        }
        return notes;
    }
    while(time<end-1e-8){
        var rawGap=0.20+random()*0.46;
        if(random()<0.20)rawGap+=0.18+random()*0.55;
        var gridGap=Math.max(0.25,Math.round(rawGap/0.25)*0.25),amount=settings.humanize/100;
        var gap=gridGap+(rawGap-gridGap)*amount;
        var rawOnset=time+(notes.length?((random()-0.5)*0.12*amount):0);
        var quantized=start+Math.round((rawOnset-start)/0.25)*0.25;
        var onset=Math.max(start,Math.min(quantized+(rawOnset-quantized)*amount,end-1e-6));
        var next=Math.min(end,time+gap),duration=clippedDuration(onset,Math.min(next-onset,(next-onset)*(0.58+random()*0.34)));
        if(random()*100<settings.density&&duration>0){
            var accent=random()<0.24,velocity=accent?108+Math.floor(random()*15):76+Math.floor(random()*23);
            notes.push({pitch:pitchAt(onset),start_time:onset,duration:Math.min(end-onset,Math.max(0.001,Math.max(0.01,duration)*settings.length/100)),velocity:velocity});
            if(random()<0.16&&onset+gap*0.48<end){
                var rawHit=onset+gap*(0.34+random()*0.18),hitQuantized=start+Math.round((rawHit-start)/0.25)*0.25,hit=hitQuantized+(rawHit-hitQuantized)*amount,hitEnd=Math.min(end,onset+gap);
                if(hit>onset+1e-6&&hit<end-1e-6){var hitDuration=clippedDuration(hit,Math.max(0.001,Math.max(0.01,Math.min(hitEnd-hit,gap*(0.16+random()*0.16)))*settings.length/100));if(hitDuration>0)notes.push({pitch:pitchAt(hit),start_time:hit,duration:hitDuration,velocity:68+Math.floor(random()*25)});}
            }
        }
        time=next;
    }
    return notes;
}
function bang(){if(!parameterChange){settings.progressionMode=1;if(!manualPreset)settings.preset=Math.floor(Math.random()*progressionBank.length);phraseSeed=Math.floor(Math.random()*2147483646)+1;if(searchMatches&&searchMatches.length)this.patcher.getnamed('browse').message('set',searchMatches.indexOf(settings.preset));}parameterChange=false;var notes=generate();result.parse(JSON.stringify({notes:notes}));outlet(0,'dictionary',result.name);var names=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];outlet(1,'set',names[Number((context.scale||{}).root_note)||0]);}
