// src/components/Profile.jsx - OPTIMIZED FAST UPLOAD
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Camera, 
  Save, 
  X, 
  Lock, 
  Mail, 
  Phone, 
  Calendar,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { auth, storage, db } from '../firebase/config';
import { updateProfile, updatePassword, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import './Profile.css';

function Profile({ user, onPhotoUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [notification, setNotification] = useState(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    studentId: '',
    bio: '',
    joinDate: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Load user data from Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              name: data.displayName || user.name || '',
              email: user.email || '',
              phone: data.phone || '',
              department: data.department || 'Computer Science',
              studentId: data.studentId || '',
              bio: data.bio || 'OJT Student passionate about web development and UI/UX design.',
              joinDate: data.joinDate || '2024'
            });
            
            // Set photo preview if available
            if (data.photoURL) {
              setPhotoPreview(data.photoURL);
            } else if (user.photoURL) {
              setPhotoPreview(user.photoURL);
            }
          } else {
            // Use auth user data
            setUserData(prev => ({
              ...prev,
              name: user.name || user.displayName || '',
              email: user.email || '',
              joinDate: '2024'
            }));
            
            // Set photo preview from auth user
            if (user.photoURL) {
              setPhotoPreview(user.photoURL);
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!userData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!userData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (userData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(userData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Phone number is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // OPTIMIZED IMAGE COMPRESSION - Much faster, smaller files
  const compressImage = async (file, maxWidth = 400, maxHeight = 400, quality = 0.6) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate the new dimensions - keep aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to compressed Blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                console.log('Original size:', (file.size / 1024).toFixed(2), 'KB');
                console.log('Compressed size:', (blob.size / 1024).toFixed(2), 'KB');
                resolve(new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                }));
              } else {
                reject(new Error('Canvas to Blob conversion failed'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  // OPTIMIZED PHOTO UPLOAD - Instant preview + Fast upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      showNotification('Please upload a valid image (JPEG, PNG, GIF, WebP)', 'error');
      return;
    }

    if (file.size > maxSize) {
      showNotification('Image size must be less than 5MB', 'error');
      return;
    }

    console.log('Starting upload process...');
    
    // INSTANT PREVIEW - Show immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      console.log('Preview set');
    };
    reader.readAsDataURL(file);

    setUploadingPhoto(true);
    
    try {
      console.log('Compressing image...');
      // Compress image for faster upload
      const compressedFile = await compressImage(file);
      console.log('Compression complete');
      
      // Create user-specific filename with timestamp
      const timestamp = Date.now();
      const fileName = `${user.uid}_${timestamp}.jpg`;
      
      console.log('Uploading to:', `profile-photos/${user.uid}/${fileName}`);
      
      // Store in user-specific folder
      const storageRef = ref(storage, `profile-photos/${user.uid}/${fileName}`);

      // Upload with metadata
      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          'uploadedBy': user.uid,
          'uploadedAt': new Date().toISOString()
        }
      };

      console.log('Starting Firebase upload...');
      
      // Use uploadBytesResumable for progress tracking
      const uploadTask = uploadBytesResumable(storageRef, compressedFile, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload: ${progress.toFixed(0)}%`);
        },
        (error) => {
          console.error('Upload error:', error);
          showNotification(`Upload failed: ${error.message}`, 'error');
          setUploadingPhoto(false);
          // Revert preview on error
          if (user.photoURL) {
            setPhotoPreview(user.photoURL);
          } else {
            setPhotoPreview(null);
          }
        },
        async () => {
          try {
            console.log('Upload complete, getting URL...');
            // Get download URL
            const photoURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Photo URL:', photoURL);

            console.log('Updating Firebase Auth...');
            // Update Firebase Auth profile
            await updateProfile(auth.currentUser, {
              photoURL: photoURL
            });

            console.log('Updating Firestore...');
            // Update Firestore user document
            await updateDoc(doc(db, 'users', user.uid), {
              photoURL: photoURL,
              updatedAt: new Date().toISOString(),
              photoFileName: fileName
            });

            console.log('All updates complete!');
            
            // Update local preview
            setPhotoPreview(photoURL);
            
            // Notify parent component
            if (onPhotoUpdate) {
              onPhotoUpdate(photoURL);
            }

            showNotification('Profile photo updated successfully!', 'success');
            setUploadingPhoto(false);
          } catch (error) {
            console.error('Error saving photo URL:', error);
            showNotification(`Failed to save: ${error.message}`, 'error');
            setUploadingPhoto(false);
          }
        }
      );
    } catch (error) {
      console.error('Error processing image:', error);
      showNotification(`Processing failed: ${error.message}`, 'error');
      setUploadingPhoto(false);
      // Revert preview on error
      if (user.photoURL) {
        setPhotoPreview(user.photoURL);
      } else {
        setPhotoPreview(null);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const currentUser = auth.currentUser;
      
      // Update profile in Firebase Auth
      await updateProfile(currentUser, {
        displayName: userData.name
      });

      // Update email if changed
      if (userData.email !== user.email) {
        await updateEmail(currentUser, userData.email);
      }

      // Update additional data in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: userData.name,
        email: userData.email,
        phone: userData.phone,
        department: userData.department,
        studentId: userData.studentId,
        bio: userData.bio,
        updatedAt: new Date().toISOString()
      });

      // Update photoURL if it was changed separately
      if (photoPreview && photoPreview.startsWith('https://')) {
        await updateProfile(currentUser, {
          photoURL: photoPreview
        });
        
        // Notify parent component
        if (onPhotoUpdate) {
          onPhotoUpdate(photoPreview);
        }
      }

      showNotification('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.code === 'auth/requires-recent-login') {
        showNotification('Please re-login to update your email', 'error');
      } else {
        showNotification('Failed to update profile. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      const currentUser = auth.currentUser;
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password
      await updatePassword(currentUser, passwordData.newPassword);
      
      showNotification('Password changed successfully!', 'success');
      setIsPasswordEditing(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        showNotification('Current password is incorrect', 'error');
      } else {
        showNotification('Failed to change password. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const getInitials = () => {
    if (userData.name) {
      return userData.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrors({});
  };

  const handleUploadClick = () => {
    if (isEditing && !uploadingPhoto) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="profile-container">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            {photoPreview ? (
              <img 
                src={photoPreview} 
                alt="Profile" 
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-initials">
                {getInitials()}
              </div>
            )}
            
            {/* Camera Icon - Only enabled when editing */}
            <button
              className={`upload-photo-btn ${!isEditing || uploadingPhoto ? 'disabled' : ''}`}
              onClick={handleUploadClick}
              disabled={!isEditing || uploadingPhoto}
              title={isEditing ? "Change Profile Photo" : "Click Edit Profile first"}
            >
              {uploadingPhoto ? (
                <Loader2 size={16} className="spinning" />
              ) : (
                <Camera size={16} />
              )}
              <span>Change Photo</span>
            </button>
            
            <input
              ref={fileInputRef}
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={!isEditing || uploadingPhoto}
              hidden
            />
            
            {uploadingPhoto && (
              <div className="uploading-overlay">
                <div className="uploading-spinner"></div>
              </div>
            )}
          </div>
          
          <div className="profile-info-header">
            <h1 className="profile-name">{userData.name}</h1>
            <p className="profile-email">{userData.email}</p>
            <div className="profile-role-badge">
              <User size={12} />
              <span>OJT Student</span>
            </div>
          </div>
        </div>

        {!isEditing && !isPasswordEditing && (
          <button 
            className="edit-profile-btn"
            onClick={handleEditClick}
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Personal Information Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <User size={20} />
              Personal Information
            </h2>
            {isEditing && (
              <div className="section-actions">
                <button 
                  className="save-btn"
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="loading-spinner-small"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  Save Changes
                </button>
                <button 
                  className="cancel-btn"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  Full Name
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="name"
                      value={userData.name}
                      onChange={handleInputChange}
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <span className="error-message">{errors.name}</span>
                    )}
                  </>
                ) : (
                  <div className="form-value">{userData.name}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} />
                  Email Address
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      onChange={handleInputChange}
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="Enter your email"
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <span className="error-message">{errors.email}</span>
                    )}
                  </>
                ) : (
                  <div className="form-value">{userData.email}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} />
                  Phone Number
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      className={`form-input ${errors.phone ? 'error' : ''}`}
                      placeholder="Enter your phone number"
                      disabled={isLoading}
                    />
                    {errors.phone && (
                      <span className="error-message">{errors.phone}</span>
                    )}
                  </>
                ) : (
                  <div className="form-value">{userData.phone || 'Not set'}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  Join Date
                </label>
                <div className="form-value">{userData.joinDate}</div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">Bio</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={userData.bio}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Tell us about yourself"
                    rows="3"
                    disabled={isLoading}
                  />
                ) : (
                  <div className="form-value bio-text">{userData.bio}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department</label>
                {isEditing ? (
                  <select
                    name="department"
                    value={userData.department}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={isLoading}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                ) : (
                  <div className="form-value">{userData.department}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Student ID</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="studentId"
                    value={userData.studentId}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter student ID"
                    disabled={isLoading}
                  />
                ) : (
                  <div className="form-value">{userData.studentId || 'Not set'}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <Lock size={20} />
              Password & Security
            </h2>
            {!isPasswordEditing && !isEditing && (
              <button 
                className="change-password-btn"
                onClick={() => setIsPasswordEditing(true)}
              >
                Change Password
              </button>
            )}
          </div>

          {isPasswordEditing && (
            <div className="password-form">
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`form-input ${errors.currentPassword ? 'error' : ''}`}
                    placeholder="Enter current password"
                    disabled={isLoading}
                  />
                  {errors.currentPassword && (
                    <span className="error-message">{errors.currentPassword}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`form-input ${errors.newPassword ? 'error' : ''}`}
                    placeholder="Enter new password"
                    disabled={isLoading}
                  />
                  {errors.newPassword && (
                    <span className="error-message">{errors.newPassword}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <span className="error-message">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>

              <div className="password-actions">
                <button 
                  className="save-btn"
                  onClick={handleChangePassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="loading-spinner-small"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  Update Password
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setIsPasswordEditing(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setErrors({});
                  }}
                  disabled={isLoading}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!isPasswordEditing && (
            <div className="security-info">
              <p className="info-text">
                Last password change: <span className="info-value">Recently</span>
              </p>
              <p className="info-text">
                Account status: <span className="info-value active">Active</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;