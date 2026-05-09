import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newImage, setNewImage] = useState({ image_url: '', caption: '' })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = () => {
    api.getGallery().then(data => {
      setImages(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const reader = new FileReader()
    reader.onload = () => {
      setNewImage({ ...newImage, image_url: reader.result })
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleAdd = async () => {
    if (!newImage.image_url) return
    try {
      await api.addGalleryImage(newImage)
      setShowAdd(false)
      setNewImage({ image_url: '', caption: '' })
      loadImages()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this image?')) return
    try {
      await api.deleteGalleryImage(id)
      loadImages()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🖼 Gallery</h1>
        <button onClick={() => setShowAdd(true)}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700">
          + Add Image
        </button>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🖼</div>
          <p className="text-gray-400 text-lg">No images yet</p>
          <p className="text-gray-400 text-sm mt-2">Add images to showcase your salon's work</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(img => (
            <div key={img.id} className="relative group">
              <img src={img.image_url} alt={img.caption || 'Gallery'} className="w-full h-48 object-cover rounded-xl shadow" />
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm p-2 rounded-b-xl">
                  {img.caption}
                </div>
              )}
              <button onClick={() => handleDelete(img.id)}
                className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full text-sm opacity-0 group-hover:opacity-100 transition">
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Add Image</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
              <input type="file" accept="image/*" onChange={handleFileUpload}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
              {uploading && <p className="text-sm text-gray-400 mt-1">Processing...</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Or Image URL</label>
              <input type="url" value={newImage.image_url.startsWith('data:') ? '' : newImage.image_url}
                onChange={e => setNewImage({ ...newImage, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full border rounded-lg px-3 py-2" />
            </div>

            {newImage.image_url && (
              <div className="mb-4">
                <img src={newImage.image_url} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption (optional)</label>
              <input type="text" value={newImage.caption} onChange={e => setNewImage({ ...newImage, caption: e.target.value })}
                placeholder="Beautiful nail art..."
                className="w-full border rounded-lg px-3 py-2" />
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setShowAdd(false); setNewImage({ image_url: '', caption: '' }) }}
                className="flex-1 border px-4 py-2 rounded-lg">Cancel</button>
              <button onClick={handleAdd} disabled={!newImage.image_url}
                className="flex-1 bg-pink-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
