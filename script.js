document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const scheduleContainer = document.getElementById('schedule');
    const categorySearch = document.getElementById('categorySearch');

    const eventTitleElement = app.querySelector('header h1');
    const eventDateElement = app.querySelector('header p');

    // Initialize with embedded data
    const fullSchedule = rawScheduleData.schedule;
    const eventTitle = rawScheduleData.eventTitle;
    const eventDate = rawScheduleData.eventDate;

    eventTitleElement.textContent = eventTitle;
    eventDateElement.textContent = eventDate;

    // Helper to parse duration string (e.g., "60 min") into minutes integer
    function parseDuration(durationStr) {
        const match = durationStr.match(/(\d+)\s*min/);
        return match ? parseInt(match[1], 10) : 0;
    }

    // Helper to add minutes to a time string (e.g., "10:00 AM", 60)
    function addMinutes(timeStr, minutes) {
        const [time, ampm] = timeStr.split(' ');
        let [hours, mins] = time.split(':').map(Number);

        if (ampm === 'PM' && hours !== 12) {
            hours += 12;
        } else if (ampm === 'AM' && hours === 12) {
            hours = 0; // Midnight
        }

        const date = new Date(2000, 0, 1, hours, mins); // Use a dummy date
        date.setMinutes(date.getMinutes() + minutes);

        const newHours = date.getHours();
        const newMins = date.getMinutes();
        const newAmpm = newHours >= 12 ? 'PM' : 'AM';
        const displayHours = newHours % 12 || 12; // Convert 24h to 12h format

        return `${displayHours}:${newMins < 10 ? '0' : ''}${newMins} ${newAmpm}`;
    }

    // Function to render the schedule in chronological order
    function renderChronologicalSchedule(scheduleToRender) {
        scheduleContainer.innerHTML = ''; // Clear previous schedule

        if (scheduleToRender.length === 0) {
            scheduleContainer.innerHTML = '<p class="no-results">No talks found.</p>';
            return;
        }

        let currentTime = "10:00 AM"; // Event starts at 10:00 AM

        scheduleToRender.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('schedule-item', item.type);

            let displayTime = currentTime;
            let durationInMinutes = parseDuration(item.duration || '0 min');
            let nextItemTime = addMinutes(currentTime, durationInMinutes);

            if (item.type === 'talk') {
                nextItemTime = addMinutes(nextItemTime, 10); // Add 10 min transition after talks
            }

            itemElement.innerHTML = `
                <div class="item-time">${displayTime} - ${addMinutes(displayTime, durationInMinutes)}</div>
                <div class="item-title">${item.title}</div>
                ${item.speakers && item.speakers.length > 0 ? `<div class="item-speakers">Speakers: ${item.speakers.join(', ')}</div>` : ''}
                ${item.category && item.category.length > 0 ? `<div class="item-category">Categories: ${item.category.map(cat => `<span>${cat}</span>`).join('')}</div>` : ''}
                <div class="item-description">${item.description}</div>
            `;
            scheduleContainer.appendChild(itemElement);
            currentTime = nextItemTime;
        });
    }

    // Function to render the schedule categorized by talk category
    function renderCategorizedSchedule(scheduleToRender) {
        scheduleContainer.innerHTML = ''; // Clear previous schedule

        const categorizedTalks = {};
        scheduleToRender.filter(item => item.type === 'talk').forEach(talk => {
            talk.category.forEach(cat => {
                if (!categorizedTalks[cat]) {
                    categorizedTalks[cat] = [];
                }
                categorizedTalks[cat].push(talk);
            });
        });

        const sortedCategories = Object.keys(categorizedTalks).sort();

        if (sortedCategories.length === 0) {
            scheduleContainer.innerHTML = '<p class="no-results">No talks found for this category.</p>';
            return;
        }

        sortedCategories.forEach(category => {
            const categoryHeader = document.createElement('h2');
            categoryHeader.textContent = category;
            categoryHeader.style.marginTop = '30px';
            categoryHeader.style.color = '#3f51b5';
            scheduleContainer.appendChild(categoryHeader);

            categorizedTalks[category].forEach(talk => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('schedule-item', 'talk');

                itemElement.innerHTML = `
                    <div class="item-title">${talk.title}</div>
                    ${talk.speakers && talk.speakers.length > 0 ? `<div class="item-speakers">Speakers: ${talk.speakers.join(', ')}</div>` : ''}
                    <div class="item-category">Categories: ${talk.category.map(cat => `<span>${cat}</span>`).join('')}</div>
                    <div class="item-description">${talk.description}</div>
                    <div class="item-time">Duration: ${talk.duration}</div>
                `;
                scheduleContainer.appendChild(itemElement);
            });
        });

        // Add breaks separately, maybe at the end or in a distinct section if not searching
        const breaks = scheduleToRender.filter(item => item.type === 'break');
        if (breaks.length > 0) {
            const breaksHeader = document.createElement('h2');
            breaksHeader.textContent = "Breaks";
            breaksHeader.style.marginTop = '30px';
            breaksHeader.style.color = '#3f51b5';
            scheduleContainer.appendChild(breaksHeader);

            breaks.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('schedule-item', item.type);

                itemElement.innerHTML = `
                    <div class="item-time">${item.time} - ${addMinutes(item.time, parseDuration(item.duration))}</div>
                    <div class="item-title">${item.title}</div>
                    <div class="item-description">${item.description}</div>
                `;
                scheduleContainer.appendChild(itemElement);
            });
        }
    }


    function filterSchedule() {
        const searchTerm = categorySearch.value.toLowerCase().trim();
        if (!searchTerm) {
            renderCategorizedSchedule(fullSchedule); // Show categorized if search box is empty
            return;
        }

        const filtered = fullSchedule.filter(item =>
            item.category && item.category.some(cat => cat.toLowerCase().includes(searchTerm))
        );
        renderChronologicalSchedule(filtered); // Show chronological for search results
    }

    // Initial render
    renderCategorizedSchedule(fullSchedule);

    // Event listener for search input
    categorySearch.addEventListener('input', filterSchedule);
});
