import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaFileImage, FaTimes } from 'react-icons/fa';

const SonarUploader = ({ files, setFiles, maxFiles = 20 }) => {
  const onDrop = useCallback(acceptedFiles => {
    const newFiles = acceptedFiles.slice(0, maxFiles - files.length);
    setFiles(prev => [...prev, ...newFiles]);
  }, [files, maxFiles, setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/tiff': ['.tiff', '.tif'],
      'application/zip': ['.zip']
    },
    maxSize: 100 * 1024 * 1024
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative group cursor-pointer rounded-[20px] border-2 border-dashed p-8 text-center transition ${
          isDragActive 
            ? 'border-cyan-400 bg-cyan-500/5' 
            : 'border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.02]'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <FaCloudUploadAlt className="text-2xl text-cyan-400" />
          </div>
          <h4 className="font-semibold">Drop sonar imagery here</h4>
          <p className="text-sm text-white/50 mt-1">or click to browse</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['JPG', 'PNG', 'TIFF', 'ZIP'].map(fmt => (
              <span key={fmt} className="text-[10px] mono px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/40">
                {fmt}
              </span>
            ))}
          </div>
          <p className="text-[11px] mono text-white/30 mt-3">Maximum size: 100 MB • Up to {maxFiles} files</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid gap-2">
          <p className="text-xs mono uppercase tracking-widest text-white/40">{files.length} files selected</p>
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl glass border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <FaFileImage className="text-cyan-400 text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{file.name}</p>
                <p className="text-[11px] mono text-white/40">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={() => removeFile(idx)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white">
                <FaTimes className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SonarUploader;
