// TeacherShare Dashboard - Firestore Data Management
// Assumes Firebase is already initialized and auth/firestore are available

// Get current user's UID
function uid() {
  return auth.currentUser.uid;
}

// Add a new section
async function addSection(name) {
  try {
    const docRef = await db.collection('sections').add({
      ownerUID: uid(),
      name: name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Section added with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding section: ', error);
    throw error;
  }
}

// Remove a section
async function removeSection(id) {
  try {
    await db.collection('sections').doc(id).delete();
    console.log('Section removed: ', id);
  } catch (error) {
    console.error('Error removing section: ', error);
    throw error;
  }
}

// Add an item to a section
async function addItem(sectionId, { title, link, desc, type }) {
  try {
    const docRef = await db.collection('sections').doc(sectionId).collection('items').add({
      title,
      link,
      desc,
      type,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Item added with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding item: ', error);
    throw error;
  }
}

// Load and render sections with items
function loadSections() {
  const sectionsContainer = document.getElementById('sections');
  
  // Clear existing content
  sectionsContainer.innerHTML = '';
  
  // Query sections for current user
  db.collection('sections')
    .where('ownerUID', '==', uid())
    .orderBy('createdAt')
    .onSnapshot(async (snapshot) => {
      sectionsContainer.innerHTML = '';
      
      for (const doc of snapshot.docs) {
        const section = doc.data();
        const sectionId = doc.id;
        
        // Create section container
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'section';
        sectionDiv.dataset.sectionId = sectionId;
        
        // Section header with remove button
        const headerDiv = document.createElement('div');
        headerDiv.className = 'section-header';
        headerDiv.innerHTML = `
          <h3>${section.name}</h3>
          <button class="remove-section-btn" data-section-id="${sectionId}">Remove Section</button>
        `;
        
        // Item add form
        const formDiv = document.createElement('div');
        formDiv.className = 'add-item-form';
        formDiv.innerHTML = `
          <form class="item-form" data-section-id="${sectionId}">
            <input type="text" name="title" placeholder="Title" required>
            <input type="url" name="link" placeholder="Link" required>
            <textarea name="desc" placeholder="Description" rows="2"></textarea>
            <select name="type" required>
              <option value="">Select Type</option>
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
              <option value="image">Image</option>
              <option value="other">Other</option>
            </select>
            <button type="submit">Add Item</button>
          </form>
        `;
        
        // Items list container
        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'items-container';
        const itemsList = document.createElement('ul');
        itemsList.className = 'items-list';
        itemsDiv.appendChild(itemsList);
        
        // Assemble section
        sectionDiv.appendChild(headerDiv);
        sectionDiv.appendChild(formDiv);
        sectionDiv.appendChild(itemsDiv);
        sectionsContainer.appendChild(sectionDiv);
        
        // Wire up remove section event
        const removeBtn = headerDiv.querySelector('.remove-section-btn');
        removeBtn.addEventListener('click', async (e) => {
          const sectionId = e.target.dataset.sectionId;
          if (confirm('Are you sure you want to remove this section and all its items?')) {
            try {
              await removeSection(sectionId);
              // Section will be automatically removed from DOM by the snapshot listener
            } catch (error) {
              alert('Error removing section: ' + error.message);
            }
          }
        });
        
        // Wire up add item form
        const itemForm = formDiv.querySelector('.item-form');
        itemForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const formData = new FormData(e.target);
          const itemData = {
            title: formData.get('title'),
            link: formData.get('link'),
            desc: formData.get('desc'),
            type: formData.get('type')
          };
          
          try {
            await addItem(sectionId, itemData);
            // Reset form
            e.target.reset();
            // Items will be automatically updated by the items listener below
          } catch (error) {
            alert('Error adding item: ' + error.message);
          }
        });
        
        // Load items for this section
        loadSectionItems(sectionId, itemsList);
      }
    }, (error) => {
      console.error('Error loading sections: ', error);
    });
}

// Load items for a specific section
function loadSectionItems(sectionId, itemsList) {
  db.collection('sections').doc(sectionId).collection('items')
    .orderBy('createdAt')
    .onSnapshot((snapshot) => {
      itemsList.innerHTML = '';
      
      snapshot.docs.forEach((doc) => {
        const item = doc.data();
        const itemId = doc.id;
        
        const listItem = document.createElement('li');
        listItem.className = 'item';
        listItem.innerHTML = `
          <div class="item-content">
            <h4><a href="${item.link}" target="_blank">${item.title}</a></h4>
            <p class="item-desc">${item.desc || ''}</p>
            <span class="item-type">${item.type}</span>
            <button class="remove-item-btn" data-section-id="${sectionId}" data-item-id="${itemId}">Remove</button>
          </div>
        `;
        
        // Wire up remove item event
        const removeItemBtn = listItem.querySelector('.remove-item-btn');
        removeItemBtn.addEventListener('click', async (e) => {
          const sectionId = e.target.dataset.sectionId;
          const itemId = e.target.dataset.itemId;
          
          if (confirm('Are you sure you want to remove this item?')) {
            try {
              await db.collection('sections').doc(sectionId).collection('items').doc(itemId).delete();
              // Item will be automatically removed from DOM by the snapshot listener
            } catch (error) {
              alert('Error removing item: ' + error.message);
            }
          }
        });
        
        itemsList.appendChild(listItem);
      });
    }, (error) => {
      console.error('Error loading items: ', error);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Wait for auth state to be ready
  auth.onAuthStateChanged((user) => {
    if (user) {
      loadSections();
    } else {
      // Redirect to login or show login form
      console.log('User not authenticated');
    }
  });
});

// Export functions for external use if needed
window.TeacherShareData = {
  uid,
  addSection,
  removeSection,
  addItem,
  loadSections
};