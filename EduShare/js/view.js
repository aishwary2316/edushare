// TeacherShare Student View & About Pages
// Assumes Firebase is already initialized and firestore is available

// Get URL parameters
const params = new URLSearchParams(location.search);
const teacher = params.get('teacher');

// Initialize page based on current location
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop();
  
  if (currentPage === 'view.html' || currentPage === '' || currentPage === 'index.html') {
    initViewPage();
  } else if (currentPage === 'about.html') {
    initAboutPage();
  }
});

// Initialize view page functionality
function initViewPage() {
  const promptDiv = document.getElementById('prompt');
  const contentDiv = document.getElementById('content');
  
  if (!teacher) {
    // Show prompt form to enter teacher ID
    showPrompt(promptDiv, contentDiv);
  } else {
    // Hide prompt and show content
    hidePrompt(promptDiv, contentDiv);
    loadTeacherContent(teacher);
  }
}

// Show teacher ID prompt
function showPrompt(promptDiv, contentDiv) {
  if (promptDiv) {
    promptDiv.style.display = 'block';
    
    // Wire up the form submission
    const form = promptDiv.querySelector('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const teacherId = form.querySelector('input[name="teacher"]').value.trim();
        if (teacherId) {
          // Reload page with teacher parameter
          window.location.href = `${window.location.pathname}?teacher=${encodeURIComponent(teacherId)}`;
        }
      });
    }
  }
  
  if (contentDiv) {
    contentDiv.style.display = 'none';
  }
}

// Hide prompt and show content
function hidePrompt(promptDiv, contentDiv) {
  if (promptDiv) {
    promptDiv.style.display = 'none';
  }
  
  if (contentDiv) {
    contentDiv.style.display = 'block';
  }
}

// Load and display teacher's content
async function loadTeacherContent(teacherId) {
  const contentDiv = document.getElementById('content');
  
  try {
    // Query sections for the specified teacher
    const sectionsSnapshot = await db.collection('sections')
      .where('ownerUID', '==', teacherId)
      .orderBy('createdAt')
      .get();
    
    if (sectionsSnapshot.empty) {
      showNoContentMessage(contentDiv, 'No content available from this teacher.');
      return;
    }
    
    // Create grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'sections-grid';
    
    // Process each section
    for (const doc of sectionsSnapshot.docs) {
      const section = doc.data();
      const sectionId = doc.id;
      
      // Create section card
      const card = await createSectionCard(section, sectionId);
      gridContainer.appendChild(card);
    }
    
    // Clear content and add grid
    contentDiv.innerHTML = '';
    contentDiv.appendChild(gridContainer);
    
  } catch (error) {
    console.error('Error loading teacher content:', error);
    showNoContentMessage(contentDiv, 'Error loading content. Please try again.');
  }
}

// Create a section card with items
async function createSectionCard(section, sectionId) {
  const card = document.createElement('div');
  card.className = 'section-card';
  
  // Create card header with thumbnail and title
  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `
    <div class="thumbnail">📚</div>
    <h3 class="section-title">${section.name}</h3>
  `;
  
  // Create items container
  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'items-container';
  
  try {
    // Load items for this section
    const itemsSnapshot = await db.collection('sections')
      .doc(sectionId)
      .collection('items')
      .orderBy('createdAt')
      .get();
    
    if (itemsSnapshot.empty) {
      itemsContainer.innerHTML = '<p class="no-items">No items in this section</p>';
    } else {
      const itemsList = document.createElement('ul');
      itemsList.className = 'items-list';
      
      itemsSnapshot.docs.forEach((doc) => {
        const item = doc.data();
        const listItem = createItemElement(item);
        itemsList.appendChild(listItem);
      });
      
      itemsContainer.appendChild(itemsList);
    }
  } catch (error) {
    console.error('Error loading items for section:', sectionId, error);
    itemsContainer.innerHTML = '<p class="error">Error loading items</p>';
  }
  
  // Assemble card
  card.appendChild(header);
  card.appendChild(itemsContainer);
  
  return card;
}

// Create individual item element
function createItemElement(item) {
  const listItem = document.createElement('li');
  listItem.className = 'item';
  
  // Create item content
  const itemContent = document.createElement('div');
  itemContent.className = 'item-content';
  
  // Title (linked)
  const titleLink = document.createElement('a');
  titleLink.href = item.link;
  titleLink.target = '_blank';
  titleLink.textContent = item.title;
  titleLink.className = 'item-title';
  
  // Description
  const desc = document.createElement('p');
  desc.className = 'item-desc';
  desc.textContent = item.desc || '';
  
  // Type indicator
  const typeSpan = document.createElement('span');
  typeSpan.className = 'item-type';
  typeSpan.textContent = item.type;
  
  // Add basic content
  itemContent.appendChild(titleLink);
  if (item.desc) {
    itemContent.appendChild(desc);
  }
  itemContent.appendChild(typeSpan);
  
  // Special handling for video type
  if (item.type.toLowerCase() === 'video') {
    const videoEmbed = createVideoEmbed(item.link);
    if (videoEmbed) {
      itemContent.appendChild(videoEmbed);
    }
  }
  
  listItem.appendChild(itemContent);
  return listItem;
}

// Create video embed iframe
function createVideoEmbed(url) {
  try {
    let embedUrl = '';
    
    // Handle YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractYouTubeId(url);
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }
    // Handle Vimeo URLs
    else if (url.includes('vimeo.com')) {
      const videoId = extractVimeoId(url);
      if (videoId) {
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }
    }
    
    if (embedUrl) {
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.width = '100%';
      iframe.height = '200';
      iframe.frameBorder = '0';
      iframe.allowFullscreen = true;
      iframe.className = 'video-embed';
      return iframe;
    }
  } catch (error) {
    console.error('Error creating video embed:', error);
  }
  
  return null;
}

// Extract YouTube video ID from URL
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Extract Vimeo video ID from URL
function extractVimeoId(url) {
  const regExp = /vimeo.com\/(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

// Initialize about page
function initAboutPage() {
  if (!teacher) {
    showNoContentMessage(document.body, 'No teacher ID provided.');
    return;
  }
  
  loadTeacherProfile(teacher);
}

// Load teacher profile and stats
async function loadTeacherProfile(teacherId) {
  const profileContainer = document.getElementById('profile');
  const statsContainer = document.getElementById('stats');
  const actionsContainer = document.getElementById('actions');
  
  try {
    // Load profile data
    const profileDoc = await db.collection('profiles').doc(teacherId).get();
    
    if (profileDoc.exists) {
      const profile = profileDoc.data();
      renderProfile(profile, profileContainer);
    } else {
      // Create basic profile if none exists
      renderProfile({ name: 'Teacher', bio: 'No profile information available.' }, profileContainer);
    }
    
    // Load and calculate stats
    const stats = await calculateTeacherStats(teacherId);
    renderStats(stats, statsContainer);
    
    // Add view content button
    renderActions(teacherId, actionsContainer);
    
  } catch (error) {
    console.error('Error loading teacher profile:', error);
    showNoContentMessage(document.body, 'Error loading teacher information.');
  }
}

// Calculate teacher content statistics
async function calculateTeacherStats(teacherId) {
  const stats = {
    totalSections: 0,
    totalItems: 0,
    itemTypes: {}
  };
  
  try {
    // Get all sections for this teacher
    const sectionsSnapshot = await db.collection('sections')
      .where('ownerUID', '==', teacherId)
      .get();
    
    stats.totalSections = sectionsSnapshot.size;
    
    // Count items by type
    for (const sectionDoc of sectionsSnapshot.docs) {
      const itemsSnapshot = await db.collection('sections')
        .doc(sectionDoc.id)
        .collection('items')
        .get();
      
      stats.totalItems += itemsSnapshot.size;
      
      itemsSnapshot.docs.forEach((itemDoc) => {
        const item = itemDoc.data();
        const type = item.type || 'other';
        stats.itemTypes[type] = (stats.itemTypes[type] || 0) + 1;
      });
    }
  } catch (error) {
    console.error('Error calculating stats:', error);
  }
  
  return stats;
}

// Render teacher profile
function renderProfile(profile, container) {
  if (!container) return;
  
  container.innerHTML = `
    <div class="profile-card">
      <div class="profile-avatar">👨‍🏫</div>
      <h2 class="profile-name">${profile.name || 'Teacher'}</h2>
      <p class="profile-bio">${profile.bio || 'No bio available.'}</p>
      ${profile.subject ? `<p class="profile-subject">Subject: ${profile.subject}</p>` : ''}
      ${profile.school ? `<p class="profile-school">School: ${profile.school}</p>` : ''}
    </div>
  `;
}

// Render statistics
function renderStats(stats, container) {
  if (!container) return;
  
  const typesList = Object.entries(stats.itemTypes)
    .map(([type, count]) => `<li>${type}: ${count}</li>`)
    .join('');
  
  container.innerHTML = `
    <div class="stats-card">
      <h3>Content Statistics</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">${stats.totalSections}</span>
          <span class="stat-label">Sections</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${stats.totalItems}</span>
          <span class="stat-label">Total Items</span>
        </div>
      </div>
      ${typesList ? `
        <div class="types-breakdown">
          <h4>Items by Type</h4>
          <ul>${typesList}</ul>
        </div>
      ` : ''}
    </div>
  `;
}

// Render action buttons
function renderActions(teacherId, container) {
  if (!container) return;
  
  container.innerHTML = `
    <div class="actions-card">
      <a href="view.html?teacher=${encodeURIComponent(teacherId)}" class="view-content-btn">
        View Content
      </a>
    </div>
  `;
}

// Show no content message
function showNoContentMessage(container, message) {
  if (!container) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'no-content-message';
  messageDiv.innerHTML = `
    <div class="message-content">
      <h3>📭 ${message}</h3>
      <p>Please check the teacher ID or try again later.</p>
    </div>
  `;
  
  container.innerHTML = '';
  container.appendChild(messageDiv);
}

// Export functions for external use
window.TeacherShareView = {
  initViewPage,
  initAboutPage,
  loadTeacherContent,
  loadTeacherProfile
};