// src/components/OJTEntries.jsx - FIXED IMAGE UPLOAD
import { useState, useEffect } from 'react';
import './OJTEntries.css';
import { 
  Plus, Upload, Image as ImageIcon, X, Calendar, Clock,
  CheckCircle, AlertCircle, Loader2, Eye, EyeOff
} from 'lucide-react';
import { db, storage } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';

function OJTEntries() {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { currentUser } = useAuth();

  const [newEntry, setNewEntry] = useState({
    title: '',
    date: '',
    hours: '',
    description: '',
    tasksCompleted: '',
    skillsLearned: '',
    challenges: '',
    imageUrl: ''
  });

  // Format date for input field
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setNewEntry(prev => ({ ...prev, date: today }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file) => {
    if (!file || !currentUser) return null;

    return new Promise((resolve, reject) => {
      // Create a storage reference
      const storageRef = ref(storage, `ojt-images/${currentUser.uid}/${Date.now()}_${file.name}`);
      
      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          setIsUploading(true);
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error('Upload error:', error);
          setIsUploading(false);
          reject(error);
        },
        async () => {
          // Handle successful uploads on complete
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setIsUploading(false);
            setUploadProgress(0);
            resolve(downloadURL);
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(error);
          }
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please log in to create entries');
      return;
    }

    // Basic validation
    if (!newEntry.title.trim() || !newEntry.date || !newEntry.hours || !newEntry.description.trim()) {
      alert('Please fill in all required fields (Title, Date, Hours, Description)');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let imageUrl = '';
      
      // Upload image if selected
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (error) {
          console.error('Image upload failed:', error);
          alert('Image upload failed. You can save the entry without image or try again.');
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }
      }

      // Prepare entry data
      const entryData = {
        ...newEntry,
        imageUrl,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        userEmail: currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'ojtEntries'), entryData);
      
      console.log('Entry saved with ID:', docRef.id);
      
      // Reset form
      setNewEntry({
        title: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: '',
        tasksCompleted: '',
        skillsLearned: '',
        challenges: '',
        imageUrl: ''
      });
      
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
      
      // Refresh entries list
      fetchEntries();
      
      alert('Entry saved successfully!');
      
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Error saving entry: ' + error.message);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const fetchEntries = async () => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, 'ojtEntries'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const entriesList = [];
      querySnapshot.forEach((doc) => {
        entriesList.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by date (newest first)
      entriesList.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(entriesList);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  // Fetch entries on component mount and when user changes
  useEffect(() => {
    if (currentUser) {
      fetchEntries();
    }
  }, [currentUser]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="ojt-entries-container">
      {/* Header */}
      <div className="entries-header">
        <div>
          <h1>OJT Entries</h1>
          <p>Track your internship activities and progress</p>
        </div>
        <button 
          className="add-entry-btn"
          onClick={() => setShowForm(true)}
          disabled={isSubmitting}
        >
          <Plus size={20} />
          Add New Entry
        </button>
      </div>

      {/* Entry Form Modal */}
      {showForm && (
        <div className="form-modal-overlay">
          <div className="form-modal">
            <div className="modal-header">
              <h2>Add OJT Entry</h2>
              <button 
                className="close-btn"
                onClick={() => setShowForm(false)}
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="entry-form">
              {/* Image Upload Section */}
              <div className="image-upload-section">
                <div className="upload-area" onClick={() => !isUploading && document.getElementById('imageInput').click()}>
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={48} />
                      <p>Click to upload documentation image</p>
                      <span className="file-types">JPEG, PNG (Max 5MB)</span>
                    </>
                  )}
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={isUploading || isSubmitting}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      Uploading: {Math.round(uploadProgress)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">
                    Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newEntry.title}
                    onChange={handleInputChange}
                    placeholder="What did you work on today?"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date">
                      Date <span className="required">*</span>
                    </label>
                    <div className="input-with-icon">
                      <Calendar size={18} />
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={newEntry.date}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="hours">
                      Hours <span className="required">*</span>
                    </label>
                    <div className="input-with-icon">
                      <Clock size={18} />
                      <input
                        type="number"
                        id="hours"
                        name="hours"
                        value={newEntry.hours}
                        onChange={handleInputChange}
                        placeholder="8"
                        min="0.5"
                        step="0.5"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newEntry.description}
                    onChange={handleInputChange}
                    placeholder="Describe your activities for today..."
                    rows="4"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tasksCompleted">Tasks Completed</label>
                  <textarea
                    id="tasksCompleted"
                    name="tasksCompleted"
                    value={newEntry.tasksCompleted}
                    onChange={handleInputChange}
                    placeholder="List specific tasks you completed..."
                    rows="3"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="skillsLearned">Skills Learned</label>
                  <textarea
                    id="skillsLearned"
                    name="skillsLearned"
                    value={newEntry.skillsLearned}
                    onChange={handleInputChange}
                    placeholder="What new skills or knowledge did you gain?"
                    rows="3"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="challenges">Challenges Faced</label>
                  <textarea
                    id="challenges"
                    name="challenges"
                    value={newEntry.challenges}
                    onChange={handleInputChange}
                    placeholder="Any difficulties or challenges you encountered?"
                    rows="3"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="spinner" size={18} />
                      {isUploading ? 'Uploading Image...' : 'Saving...'}
                    </>
                  ) : (
                    'Save Entry'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="entries-list">
        {entries.length === 0 ? (
          <div className="empty-state">
            <ImageIcon size={64} />
            <h3>No entries yet</h3>
            <p>Start by adding your first OJT entry</p>
            <button 
              className="add-entry-btn"
              onClick={() => setShowForm(true)}
            >
              <Plus size={20} />
              Add Your First Entry
            </button>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="entry-card">
              {entry.imageUrl && (
                <div className="entry-image">
                  <img 
                    src={entry.imageUrl} 
                    alt="Entry documentation" 
                    loading="lazy"
                  />
                </div>
              )}
              <div className="entry-content">
                <div className="entry-header">
                  <h3>{entry.title}</h3>
                  <span className="entry-date">{formatDate(entry.date)}</span>
                </div>
                <div className="entry-meta">
                  <span className="hours">
                    <Clock size={16} />
                    {entry.hours} hours
                  </span>
                </div>
                <p className="entry-description">{entry.description}</p>
                
                {entry.tasksCompleted && (
                  <div className="entry-section">
                    <h4>Tasks Completed</h4>
                    <p>{entry.tasksCompleted}</p>
                  </div>
                )}
                
                {entry.skillsLearned && (
                  <div className="entry-section">
                    <h4>Skills Learned</h4>
                    <p>{entry.skillsLearned}</p>
                  </div>
                )}
                
                {entry.challenges && (
                  <div className="entry-section">
                    <h4>Challenges</h4>
                    <p>{entry.challenges}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OJTEntries;