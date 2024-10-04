window.onload = function() {
    const backgroundContainer = document.getElementById('background-container');
    const foregroundContainer = document.getElementById('foreground-container');
    const backgroundPreview = document.getElementById('background-preview');
    const foregroundPreview = document.getElementById('foreground-preview');
    const backgroundName = document.getElementById('background-name');
    const backgroundDescription = document.getElementById('background-description');
    const foregroundName = document.getElementById('foreground-name');
    const foregroundDescription = document.getElementById('foreground-description');
    const uploadFgButton = document.getElementById('upload-fg-button');
    const uploadBgButton = document.getElementById('upload-bg-button');
    const uploadFgInput = document.getElementById('upload-fg-input');
    const uploadBgInput = document.getElementById('upload-bg-input');
    const downloadButton = document.getElementById('download-button');
    const clearUploadsButton = document.getElementById('clear-uploads-button');
    const totalPriceElement = document.getElementById('total-price');

    // Fetch and populate background and foreground options
    fetch('images/bg/background_names.txt')
        .then(response => response.text())
        .then(data => {
            const names = data.split('\n').map(name => name.trim()).filter(name => name.length > 0);
            for (let i = 0; i < names.length && i < 60; i++) {
                const [name, description, category, price] = names[i].split(';');
                let img = document.createElement('img');
                img.src = 'images/bg/' + i + '.png';
                img.alt = name;
                img.dataset.price = parseInt(price) || 0; // Set price if specified, otherwise default to 0
                img.addEventListener('click', () => {
                    backgroundPreview.src = img.src;
                    backgroundName.textContent = name;
                    backgroundDescription.textContent = description;
                    backgroundName.style.color = getColorForCategory(category);
                    backgroundPreview.dataset.price = img.dataset.price;
                    updateTotalPrice();
                });
                backgroundContainer.appendChild(img);
            }

            // Default to the red background (Assume it's at index 0)
            const [defaultName, defaultDescription, defaultCategory, defaultPrice] = names[0].split(';');
            backgroundPreview.src = 'images/bg/0.png';
            backgroundName.textContent = defaultName;
            backgroundDescription.textContent = defaultDescription;
            backgroundName.style.color = getColorForCategory(defaultCategory);
            backgroundPreview.dataset.price = parseInt(defaultPrice) || 0;
            updateTotalPrice();
        })
        .catch(error => console.error('Error loading background names:', error));

    fetch('images/fg/foreground_names.txt')
        .then(response => response.text())
        .then(data => {
            const names = data.split('\n').map(name => name.trim()).filter(name => name.length > 0);
            for (let i = 0; i < names.length && i < 59; i++) {
                const [name, description, category, price] = names[i].split(';');
                let img = document.createElement('img');
                img.src = 'images/fg/' + i + '.png';
                img.alt = name;
                img.dataset.price = parseInt(price) || 0; // Set price if specified, otherwise default to 0
                img.addEventListener('click', () => {
                    foregroundPreview.src = img.src;
                    foregroundName.textContent = name;
                    foregroundDescription.textContent = description;
                    foregroundName.style.color = getColorForCategory(category);
                    foregroundPreview.dataset.price = img.dataset.price;
                    updateTotalPrice();
                });
                foregroundContainer.appendChild(img);
            }

            // Default to the Firey foreground (Assume it's at index 0)
            const [defaultName, defaultDescription, defaultCategory, defaultPrice] = names[0].split(';');
            foregroundPreview.src = 'images/fg/0.png';
            foregroundName.textContent = defaultName;
            foregroundDescription.textContent = defaultDescription;
            foregroundName.style.color = getColorForCategory(defaultCategory);
            foregroundPreview.dataset.price = parseInt(defaultPrice) || 0;
            updateTotalPrice();
        })
        .catch(error => console.error('Error loading foreground names:', error));

    // Event listeners for upload buttons
    uploadFgButton.addEventListener('click', () => uploadFgInput.click());
    uploadBgButton.addEventListener('click', () => uploadBgInput.click());

    uploadFgInput.addEventListener('change', (event) => {
        handleImageUpload(event, 'foreground');
    });

    uploadBgInput.addEventListener('change', (event) => {
        handleImageUpload(event, 'background');
    });

    // Event listener for the download button
    downloadButton.addEventListener('click', downloadImage);

    // Event listener for the clear custom uploads button
    clearUploadsButton.addEventListener('click', clearCustomUploads);

    // Function to map category to color
    function getColorForCategory(category) {
        const colors = {
            'Default': '#FFFFFF',
            'Speaker Box': '#F77474',
            'Season 1 Contestant': '#80FF82',
            'Achievement': '#FF8E24',
            'Element': '#FFED61',
            'Solid Color': '#FFED61',
            'Event': '#4D4DFF',
            'Developer': '#FF0000',
            'Expensive': '#FF00FF',
            'Pattern': '#80FF82',
            'Location': '#74F1F7'
        };
        return colors[category] || '#FFFFFF'; // Default to white if category not found
    }

    // Update total price
    function updateTotalPrice() {
        const foregroundPrice = parseInt(foregroundPreview.dataset.price || 0);
        const backgroundPrice = parseInt(backgroundPreview.dataset.price || 0);
        const totalPrice = foregroundPrice + backgroundPrice;

        totalPriceElement.textContent = totalPrice; // Display only the plain number
    }

    // Handle foreground and background uploads
    function handleImageUpload(event, type) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const dataURL = e.target.result;
                if (type === 'foreground') {
                    foregroundPreview.src = dataURL;
                    foregroundName.textContent = 'Custom Foreground';
                    foregroundDescription.textContent = 'Custom upload';
                    foregroundPreview.dataset.price = 0;
                } else if (type === 'background') {
                    backgroundPreview.src = dataURL;
                    backgroundName.textContent = 'Custom Background';
                    backgroundDescription.textContent = 'Custom upload';
                    backgroundPreview.dataset.price = 0;
                }
                updateTotalPrice();
            };
            reader.readAsDataURL(file);
        }
    }

    // Download the combined foreground and background image
    function downloadImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 250; // Width of preview box
        canvas.height = 250; // Height of preview box
        const ctx = canvas.getContext('2d');

        // Load background and foreground images
        const backgroundImg = new Image();
        const foregroundImg = new Image();

        backgroundImg.src = backgroundPreview.src;
        foregroundImg.src = foregroundPreview.src;

        backgroundImg.onload = function() {
            ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
            foregroundImg.onload = function() {
                ctx.drawImage(foregroundImg, 0, 0, canvas.width, canvas.height);

                // Create a link to download the image
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = 'BranchesPFPMakerOutput.png';
                link.click();
            };
        };
    }

    // Clear custom uploads
    function clearCustomUploads() {
        foregroundPreview.src = 'images/fg/0.png';
        foregroundName.textContent = 'Firey';
        foregroundDescription.textContent = '"KEEP THOSE NECK MUSCLES EXTENDED!"';
        foregroundPreview.dataset.price = 0;

        backgroundPreview.src = 'images/bg/0.png';
        backgroundName.textContent = 'Red';
        backgroundDescription.textContent = 'Unlocked by default.';
        backgroundPreview.dataset.price = 0;

        updateTotalPrice();
    }
};
