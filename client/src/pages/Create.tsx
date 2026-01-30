import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Wand2, X, Loader2, Send, Image as ImageIcon, Film, Clapperboard, Radio, SlidersHorizontal, Settings, Music, Camera, Users, Hand } from 'lucide-react';

const useAuth = () => ({ user: { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' } });
const CLOUD_NAME = 'dlfbrjuwy';

type Mode = 'live' | 'shorts' | 'image' | 'status';
type Media = {
  url: string | null;
  publicId: string | null;
  type: 'image' | 'video' | null;
  transformations: {
    effect: string | null;
    brightness: number;
    contrast: number;
    saturate: number;
  };
};
type PublishModal = {
  isOpen: boolean;
  type: 't-feed' | 'story' | 't-short' | null;
};

const CreationStudio = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('image');
  const [media, setMedia] = useState<Media>({ url: null, publicId: null, type: null, transformations: { effect: null, brightness: 0, contrast: 0, saturate: 0 }});
  const [transformedUrl, setTransformedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [publishModal, setPublishModal] = useState<PublishModal>({ isOpen: false, type: null });
  const [postContent, setPostContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const modesRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [liveAudience, setLiveAudience] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [trimRange, setTrimRange] = useState([0, 100]);
  const [publishStep, setPublishStep] = useState(1);

  const MODES: Record<Mode, string> = { live: "Live", shorts: "Shorts", image: "Image", status: "Status" };
  const QUICK_TOOLS: Record<Mode, { icon: React.ElementType; panel: string; label: string }[]> = {
    image: [{ icon: Wand2, panel: 'filters', label: 'Filters' }, { icon: SlidersHorizontal, panel: 'adjustments', label: 'Adjustments' }],
    shorts: [{ icon: Music, panel: 'music', label: 'Music' }, { icon: Film, panel: 'trim', label: 'Trim'}],
    status: [{ icon: Wand2, panel: 'filters', label: 'Filters' }],
    live: [],
  };

  const MODE_THEMES: Record<Mode, { glow: string; border: string; text: string; gradient: string; buttonText?: string }> = {
    live: { glow: 'shadow-red-500/40', border: 'border-red-500', text: 'text-red-500', gradient: 'from-red-500/20', buttonText: 'GO LIVE' },
    shorts: { glow: 'shadow-purple-500/40', border: 'border-purple-500', text: 'text-purple-500', gradient: 'from-purple-500/20' },
    image: { glow: 'shadow-orange-500/40', border: 'border-orange-500', text: 'text-orange-500', gradient: 'from-orange-500/20' },
    status: { glow: 'shadow-blue-500/40', border: 'border-blue-500', text: 'text-blue-500', gradient: 'from-blue-500/20' },
  };
  const theme = MODE_THEMES[mode];

  const onDrop = useCallback(async (acceptedFiles: FileWithPath[]) => {
    let file = acceptedFiles[0];
    if (!file) return;

    setIsLoading(true);
    const type = file.type.startsWith('image') ? 'image' : 'video';
    
    if (type === 'image') {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(file, options);
        console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
        console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB
        file = compressedFile as File;
      } catch (error) {
        console.error('Image compression error:', error);
      }
    }

    const targetMode = type === 'image' ? 'image' : 'shorts';
    setMode(targetMode);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      setMedia(prev => ({...prev, url: data.url, publicId: data.public_id, type: type}));
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': [], 'video/*': [] }, noClick: true, multiple: false, disabled: !!media.url });

  const buildCloudinaryUrl = (publicId: string, transformations: Media['transformations']) => {
    if (!publicId) return null;
    const t_parts = [
      transformations.effect ? `e_${transformations.effect}` : null,
      transformations.brightness ? `e_brightness:${transformations.brightness}` : null,
      transformations.contrast ? `e_contrast:${transformations.contrast}` : null,
      transformations.saturate ? `e_saturation:${transformations.saturate}` : null
    ].filter(Boolean).join(',');
    return `https://res.cloudinary.com/${CLOUD_NAME}/${media.type || 'image'}/upload/${t_parts ? t_parts + '/' : ''}${publicId}`;
  };

  useEffect(() => { setTransformedUrl(media.publicId && media.type === 'image' ? buildCloudinaryUrl(media.publicId, media.transformations) : media.url); }, [media]);
  
  useEffect(() => { const node = modesRef.current[mode]; if (node) setIndicatorStyle({ width: node.offsetWidth, left: node.offsetLeft }); }, [mode]);
  
  useEffect(() => { let i: NodeJS.Timeout | undefined; if (mode === 'live') { i = setInterval(() => setLiveAudience(p => Math.max(0, p + Math.floor(Math.random() * 6) - 2)), 3000); } else { setLiveAudience(0); } return () => clearInterval(i); }, [mode]);

  const handleClearMedia = () => { setMedia({ url: null, publicId: null, type: null, transformations: { effect: null, brightness: 0, contrast: 0, saturate: 0 }}); setActivePanel(null); setPostContent(""); };
  
  const handleMainButton = () => { 
    if (mode === 'live') return; 
    if (!media.url) {
        (document.querySelector('input[type="file"]') as HTMLInputElement)?.click();
        return;
    }
    const publishType = { image: 't-feed', status: 'story', shorts: 't-short' }[mode] as PublishModal['type'];
    setPublishStep(1);
    setPublishModal({ isOpen: true, type: publishType }); 
  };
  
  const handlePublish = () => {
      setIsPublishing(true);
      // Simulating an API call
      setTimeout(() => {
          console.log('Publishing content:', postContent);
          alert('تم النشر بنجاح!');
          setIsPublishing(false);
          setPublishModal({isOpen: false, type: null});
          handleClearMedia();
      }, 2000);
  }

  return (
    <TooltipProvider>
      <div dir="rtl" className="w-full h-screen bg-black text-white font-sans overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
          
          <AnimatePresence>
            <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 1 } }} exit={{ opacity: 0 }} className={`absolute inset-0 z-0 w-full h-full bg-gradient-to-t ${theme.gradient} to-transparent mix-blend-soft-light`} style={{ backgroundPosition: 'center bottom', backgroundRepeat: 'no-repeat', backgroundSize: '150% 50%' }} />
          </AnimatePresence>

          <div {...getRootProps()} className="w-full h-full z-10">
            <AnimatePresence>
              {media.url ? (
                <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} className="w-full h-full">
                  {media.type === 'image' && transformedUrl ? (
                    <img src={isPressing ? media.url : transformedUrl} alt="Preview" className="w-full h-full object-contain cursor-pointer" onMouseDown={() => media.transformations.effect && setIsPressing(true)} onMouseUp={() => setIsPressing(false)} onMouseLeave={() => setIsPressing(false)} onTouchStart={() => media.transformations.effect && setIsPressing(true)} onTouchEnd={() => setIsPressing(false)} />
                  ) : media.type === 'video' ? (
                    <video src={media.url} controls autoPlay loop className="w-full h-full object-contain" />
                  ) : null}
                </motion.div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {mode === 'live' ? (
                    <div className="text-center"><Radio className={`h-24 w-24 ${theme.text} mx-auto animate-pulse`}/><h2 className="text-4xl font-bold mt-4">مستعد للبث المباشر؟</h2></div>
                  ) : (
                    <div className="text-center text-gray-500"><p>اضغط على الزر الرئيسي للبدء</p></div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>

          {isLoading && <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center"><Loader2 className="h-16 w-16 text-purple-400 animate-spin" /></div>}

          <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
            <Button onClick={handleClearMedia} variant="ghost" size="icon" className="rounded-full"><X className="h-6 w-6" /></Button>
            {mode === 'live' && liveAudience > 0 && (<motion.div initial={{scale:0}} animate={{scale:1}} className="flex items-center space-x-2 bg-red-600/80 px-3 py-1 rounded-full text-white font-bold"><Users className="h-4 w-4 ml-2" /><span>{liveAudience}</span></motion.div>)}
            {media.url && <Button onClick={handleMainButton} variant="ghost" className={`rounded-full ${theme.text} font-bold`}>التالي</Button>}
          </div>
          
          <AnimatePresence>{media.url && media.type === 'image' && media.transformations.effect && !isPressing && (<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-black/50 px-3 py-1.5 rounded-full text-xs pointer-events-none flex items-center"><Hand className="h-3 w-3 ml-1.5"/> اضغط مع الاستمرار لرؤية النسخة الأصلية</motion.div>)}</AnimatePresence>
          <AnimatePresence>{media.url && QUICK_TOOLS[mode]?.length > 0 && (<motion.div initial={{x:-100}} animate={{x:0}} exit={{x:-100}} className="absolute top-1/2 -translate-y-1/2 left-4 z-20 flex flex-col space-y-2 p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">{QUICK_TOOLS[mode].map(tool => (<Tooltip key={tool.panel}><TooltipTrigger asChild><Button onClick={() => alert(`${tool.label} قيد التطوير!`)} variant="ghost" size="icon" className="rounded-full w-12 h-12 hover:bg-white/20"><tool.icon className="h-6 w-6" /></Button></TooltipTrigger><TooltipContent side="right"><p>{tool.label}</p></TooltipContent></Tooltip>))}</motion.div>)}</AnimatePresence>
          <AnimatePresence>{mode === 'shorts' && media.url && (<motion.div initial={{y:100,opacity:0}} animate={{y:0,opacity:1}} exit={{y:100,opacity:0}} className="absolute bottom-28 left-0 right-0 z-20 px-10"><div className="bg-black/50 p-3 rounded-xl backdrop-blur-sm border border-white/10"><p className="text-center text-xs font-bold mb-2">قص الفيديو</p><Slider dir="ltr" value={trimRange} onValueChange={setTrimRange} max={100} step={1} className="w-full"/></div></motion.div>)}</AnimatePresence>

          <div className="absolute bottom-0 left-0 right-0 z-20 p-6 flex flex-col items-center bg-gradient-to-t from-black/60 to-transparent">
            <div className="relative flex items-center justify-center space-x-8 mb-6">
               {(Object.keys(MODES) as Mode[]).map(key => (<button key={key} ref={el => modesRef.current[key] = el} onClick={() => !media.url && setMode(key)} className={`transition-all duration-300 ${mode === key ? `${theme.text} font-bold` : 'text-gray-400'} ${media.url ? 'cursor-not-allowed': ''}`}>{MODES[key]}</button>))}
               <motion.div className={`absolute -bottom-2 h-1 ${theme.text.replace('text-','bg-')} rounded-full`} animate={indicatorStyle} transition={{ type: 'spring', stiffness: 500, damping: 30 }}/>
            </div>
            <div className="w-20 h-20 flex items-center justify-center">
                <button onClick={handleMainButton} className="w-full h-full bg-white rounded-full flex items-center justify-center relative shadow-lg active:scale-95 transition-transform">
                    <div className={`absolute inset-0 rounded-full border-2 ${theme.border} animate-pulse-slow shadow-lg ${theme.glow}`}></div>
                    {theme.buttonText ? <span className="text-black font-bold text-sm">{theme.buttonText}</span> : <Camera className="h-8 w-8 text-black"/>}
                </button>
            </div>
            <input {...getInputProps()} className="hidden" />
          </div>
        </div>

        <Dialog open={publishModal.isOpen} onOpenChange={(isOpen) => setPublishModal({ ...publishModal, isOpen })}>
            <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[480px] rounded-xl">
                <DialogHeader><DialogTitle className={`text-2xl ${theme.text}`}>اللمسات الأخيرة</DialogTitle></DialogHeader>
                <div className="py-4 space-y-4">
                    <Textarea placeholder="أضف تعليقًا..." className="bg-gray-800 border-gray-700 min-h-[100px] text-base" value={postContent} onChange={(e) => setPostContent(e.target.value)} />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="ghost" size="lg">إلغاء</Button></DialogClose>
                    <Button type="button" onClick={handlePublish} size="lg" className={`rounded-full ${theme.text.replace('text-','bg-')} hover:opacity-90`} disabled={isPublishing}>
                        {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        مشاركة
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default CreationStudio;