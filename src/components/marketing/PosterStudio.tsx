import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Download, LayoutTemplate, Type, Image as ImageIcon, Copy, ArrowRight, Save } from "lucide-react";
import { motion } from "framer-motion";

interface PosterStudioProps {
  clinicDetails: any;
  user: any;
  darkMode: boolean;
  showToast: (msg: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function PosterStudio({ clinicDetails, user, darkMode, showToast, setActiveTab }: PosterStudioProps) {
  const [posterTopic, setPosterTopic] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [posterData, setPosterData] = useState({
    headline: "Your Health, Our Priority",
    subheadline: "Complete Health Checkup Available",
    clinicName: user?.name || "CareBridge Clinic",
    doctorName: clinicDetails?.doctor_name || "Dr. Expert",
    contact: clinicDetails?.contact_no || user?.phone || "98765 43210",
    address: clinicDetails?.address || "City Center",
    bgColor: "#0f766e", // teal-700
    textColor: "#ffffff",
    logoUrl: user?.logo || "",
    bgImageUrl: ""
  });

  const generateAIPosterText = () => {
    if (!posterTopic) return;
    setIsGeneratingAI(true);
    
    // Simulate AI generation
    setTimeout(() => {
      let headline = posterTopic.length > 0 ? posterTopic.substring(0, 30) : "Your Health, Our Priority";
      let subheadline = "Join us at the clinic today.";
      let bgColor = "#0f766e"; 

      const topicLower = posterTopic.toLowerCase();
      if (topicLower.includes("festival")) {
        headline = "Wishing You Health & Happiness!";
        bgColor = "#d97706";
      } else if (topicLower.includes("diabetes")) {
        headline = "Beat Diabetes Today";
        bgColor = "#0284c7";
      }

      setPosterData(prev => ({ ...prev, headline, subheadline, bgColor }));
      setIsGeneratingAI(false);
      showToast("AI Poster generated successfully!");
    }, 1500);
  };

  const drawPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1080;

    // Background
    ctx.fillStyle = posterData.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawContent = () => {
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = posterData.textColor;
      ctx.textAlign = "center";

      ctx.font = "bold 80px sans-serif";
      ctx.fillText(posterData.headline, canvas.width / 2, 400);

      ctx.font = "40px sans-serif";
      ctx.fillText(posterData.subheadline, canvas.width / 2, 500);

      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.fillRect(50, canvas.height - 250, canvas.width - 100, 200);

      ctx.fillStyle = "#0f172a";
      ctx.textAlign = "left";
      
      ctx.font = "bold 50px sans-serif";
      ctx.fillText(posterData.clinicName, 100, canvas.height - 180);

      ctx.font = "30px sans-serif";
      ctx.fillText(posterData.doctorName, 100, canvas.height - 120);

      ctx.textAlign = "right";
      ctx.font = "bold 35px sans-serif";
      ctx.fillText("📞 " + posterData.contact, canvas.width - 100, canvas.height - 160);
      
      ctx.font = "25px sans-serif";
      ctx.fillText(posterData.address, canvas.width - 100, canvas.height - 110);
    };

    if (posterData.bgImageUrl) {
      const bgImg = new Image();
      bgImg.onload = () => {
        const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
        const x = (canvas.width / 2) - (bgImg.width / 2) * scale;
        const y = (canvas.height / 2) - (bgImg.height / 2) * scale;
        ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
        drawContent();
      };
      bgImg.src = posterData.bgImageUrl;
    } else {
      drawContent();
    }
  };

  useEffect(() => {
    drawPoster();
  }, [posterData]);

  const downloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'clinic_poster.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col gap-6">
      <div className={`p-6 rounded-3xl border shadow-sm ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Sparkles className="text-purple-500" /> AI Poster Studio
        </h3>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={posterTopic}
            onChange={(e) => setPosterTopic(e.target.value)}
            placeholder="Describe your poster (e.g., 'Create a premium Dengue Awareness poster')"
            className={`flex-1 px-4 py-3 rounded-xl border outline-none ${darkMode ? "bg-slate-900 border-slate-700 focus:border-teal-500" : "bg-slate-50 border-slate-200 focus:border-teal-500"}`}
          />
          <button 
            onClick={generateAIPosterText}
            disabled={isGeneratingAI || !posterTopic}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-white transition-all shadow-md ${
              isGeneratingAI || !posterTopic ? "bg-slate-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            {isGeneratingAI ? "Generating..." : "Generate AI Poster"}
            <Sparkles size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Toolbar */}
        <div className={`w-full lg:w-72 flex-shrink-0 p-4 rounded-3xl border overflow-y-auto shadow-sm ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">Editing Tools</h4>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-2 block">Background Color</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={posterData.bgColor}
                  onChange={(e) => setPosterData({...posterData, bgColor: e.target.value})}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <span className="text-sm font-mono uppercase">{posterData.bgColor}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-2 block">Headline</label>
              <textarea 
                value={posterData.headline}
                onChange={(e) => setPosterData({...posterData, headline: e.target.value})}
                className={`w-full px-3 py-2 rounded-xl border outline-none resize-none ${darkMode ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                rows={2}
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 mb-2 block">Subheadline</label>
              <textarea 
                value={posterData.subheadline}
                onChange={(e) => setPosterData({...posterData, subheadline: e.target.value})}
                className={`w-full px-3 py-2 rounded-xl border outline-none resize-none ${darkMode ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Center Canvas Area */}
        <div className={`flex-1 p-6 rounded-3xl border flex items-center justify-center shadow-inner overflow-hidden ${darkMode ? "bg-slate-900 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
           <canvas 
              ref={canvasRef} 
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl border border-slate-300 dark:border-slate-700"
              style={{ aspectRatio: '1/1' }}
            />
        </div>

        {/* Right Actions Toolbar */}
        <div className={`w-full lg:w-64 flex-shrink-0 p-4 rounded-3xl border flex flex-col gap-3 shadow-sm ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-2">Actions</h4>
          
          <button onClick={downloadPoster} className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${darkMode ? "border-slate-600 hover:bg-slate-700 text-white" : "border-slate-200 hover:bg-slate-50 text-slate-800"}`}>
            <Download size={18} /> Download
          </button>
          
          <button className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${darkMode ? "border-slate-600 hover:bg-slate-700 text-white" : "border-slate-200 hover:bg-slate-50 text-slate-800"}`}>
            <Save size={18} /> Save to Library
          </button>

          <div className="flex-1"></div>

          <button 
            onClick={() => setActiveTab("campaign")}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-lg shadow-lg flex flex-col items-center justify-center gap-1 transition-all"
          >
            Create Campaign
            <span className="text-xs font-medium opacity-80 flex items-center gap-1">Using this poster <ArrowRight size={12} /></span>
          </button>
        </div>

      </div>
    </motion.div>
  );
}
