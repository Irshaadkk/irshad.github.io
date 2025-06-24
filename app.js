// js/app.js
$('#toggleAdminPanel').click(() => {
  $('#adminPanel').show(); // or toggleClass('active')
});

$('#closeAdminPanel').click(() => {
  $('#adminPanel').hide();
});
$('#adminLoginBtn').click(() => {
  const username = $('#adminUsername').val();
  const password = $('#adminPassword').val();

  // Example validation (replace with real auth)
  if (username === 'admin' && password === 'password123') {
    $('#loginSection').hide();
    $('#adminContent').show();
    $('#loginStatus').text('');
  } else {
    $('#loginStatus').text('Invalid credentials.').css('color', 'red');
  }
});
$('#adminLogoutBtn').click(() => {
  $('#adminContent').hide();
  $('#loginSection').show();
  $('#adminUsername, #adminPassword').val('');
});

// --- Global Data Arrays (populated from localStorage or initial data) ---
let currentCommittee = [];
let currentEvents = [];
let currentSuccessStories = [];
let adminCredentials = null; // Will be loaded from htdocs/credentials.json or localStorage

// --- jQuery DOM Selectors (cached for efficiency) ---
const $aboutContentSection = $('#about-content-section');
const $coreTeamGrid = $('#coreTeamGrid');
const $eventsGrid = $('#eventsGrid');
const $successStoriesGrid = $('#successStoriesGrid');

const $toggleAdminPanelBtn = $('#toggleAdminPanel');
const $closeAdminPanelBtn = $('#closeAdminPanel');
const $adminPanel = $('#adminPanel');
const $adminLoginBtn = $('#adminLoginBtn');
const $adminUsernameInput = $('#adminUsername');
const $adminPasswordInput = $('#adminPassword');
const $loginStatus = $('#loginStatus');
const $adminContent = $('#adminContent');
const $adminLogoutBtn = $('#adminLogoutBtn');

const $memberIdInput = $('#memberId');
const $memberNameInput = $('#memberName');
const $memberRoleInput = $('#memberRole');
const $memberImageInput = $('#memberImage');
const $addUpdateMemberBtn = $('#addUpdateMemberBtn');

const $eventIdInput = $('#eventId');
const $eventTitleInput = $('#eventTitle');
const $eventDateInput = $('#eventDate');
const $eventDescriptionInput = $('#eventDescription');
const $addUpdateEventBtn = $('#addUpdateEventBtn');

const $storyIdInput = $('#storyId');
const $storyTitleInput = $('#storyTitle');
const $storyContentInput = $('#storyContent');
const $storyAuthorInput = $('#storyAuthor');
const $addUpdateStoryBtn = $('#addUpdateStoryBtn');

const $emailStoriesBtn = $('#emailStoriesBtn');
const $emailStatus = $('#emailStatus');


// --- Data Management Functions (using localStorage) ---

function loadData() {
    // Load Committee
    const storedCommittee = localStorage.getItem('committee');
    if (storedCommittee) {
        const parsed = JSON.parse(storedCommittee);
        currentCommittee = parsed.map(data => new CommitteeMember(data.id, data.name, data.role, data.imageUrl));
    } else {
        currentCommittee = initialCommittee;
    }

    // Load Events
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
        const parsed = JSON.parse(storedEvents);
        currentEvents = parsed.map(data => new Event(data.id, data.title, data.date, data.description));
    } else {
        currentEvents = initialEvents;
    }

    // Load Success Stories
    const storedStories = localStorage.getItem('successStories');
    if (storedStories) {
        const parsed = JSON.parse(storedStories);
        currentSuccessStories = parsed.map(data => new SuccessStory(data.id, data.title, data.content, data.author));
    } else {
        currentSuccessStories = initialSuccessStories;
    }

    // Load Admin Credentials (simulate from htdocs/credentials.json if not in localStorage)
    const storedCredentials = localStorage.getItem('adminCredentials');
    if (storedCredentials) {
        adminCredentials = JSON.parse(storedCredentials);
    } else {
        // Use jQuery's AJAX for fetching credentials.json
        $.ajax({
            url: 'htdocs/credentials.json',
            dataType: 'json',
            success: function(data) {
                adminCredentials = data;
                localStorage.setItem('adminCredentials', JSON.stringify(data)); // Cache for future
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Could not load admin credentials from htdocs/credentials.json. Using default (admin/password123).", textStatus, errorThrown);
                adminCredentials = { username: "admin", password: "password123" };
            }
        });
    }
}

function saveData() {
    localStorage.setItem('committee', JSON.stringify(currentCommittee));
    localStorage.setItem('events', JSON.stringify(currentEvents));
    localStorage.setItem('successStories', JSON.stringify(currentSuccessStories));
}

// --- Rendering Functions (using jQuery) ---

function renderAboutUs() {
    $aboutContentSection.html(aboutUsContent); // Inject static about us content
}

function renderCommittee() {
    $coreTeamGrid.empty(); // Clear existing content using jQuery
    currentCommittee.forEach(member => {
        $coreTeamGrid.append(member.render()); // Append HTML using jQuery
    });
}

function renderEvents() {
    $eventsGrid.empty();
    currentEvents.forEach(event => {
        $eventsGrid.append(event.render());
    });
}

function renderSuccessStories() {
    $successStoriesGrid.empty();
    currentSuccessStories.forEach(story => {
        $successStoriesGrid.append(story.render());
    });
}

// --- Admin Panel Logic (using jQuery) ---

function showAdminPanel() {
    $adminPanel.addClass('active');
}

function hideAdminPanel() {
    $adminPanel.removeClass('active');
}

function loginAdmin() {
    const username = $adminUsernameInput.val();
    const password = $adminPasswordInput.val();

    if (adminCredentials && username === adminCredentials.username && password === adminCredentials.password) {
        $loginStatus.text('');
        $('body').addClass('admin-logged-in');
        $adminContent.show();
        $('#loginSection').hide();
        alert('Admin login successful!');
    } else {
        $loginStatus.text('Invalid username or password.');
    }
}

function logoutAdmin() {
    $('body').removeClass('admin-logged-in');
    $adminContent.hide();
    $('#loginSection').show();
    $adminUsernameInput.val('');
    $adminPasswordInput.val('');
    $loginStatus.text('');
    alert('Admin logged out.');
}

function addUpdateMember() {
    const id = $memberIdInput.val() ? parseInt($memberIdInput.val()) : Date.now(); // Use ID if provided, otherwise generate new
    const name = $memberNameInput.val().trim();
    const role = $memberRoleInput.val().trim();
    const imageUrl = $memberImageInput.val().trim();

    if (!name || !role || !imageUrl) {
        alert('Please fill all member fields.');
        return;
    }

    let memberExists = false;
    currentCommittee = currentCommittee.map(member => {
        if (member.id === id) {
            memberExists = true;
            return new CommitteeMember(id, name, role, imageUrl); // Update existing
        }
        return member;
    });

    if (!memberExists) {
        currentCommittee.push(new CommitteeMember(id, name, role, imageUrl)); // Add new
    }

    saveData();
    renderCommittee();
    alert('Committee member saved successfully!');
    // Clear form
    $memberIdInput.val('');
    $memberNameInput.val('');
    $memberRoleInput.val('');
    $memberImageInput.val('');
}

function addUpdateEvent() {
    const id = $eventIdInput.val() ? parseInt($eventIdInput.val()) : Date.now();
    const title = $eventTitleInput.val().trim();
    const date = $eventDateInput.val().trim();
    const description = $eventDescriptionInput.val().trim();

    if (!title || !date || !description) {
        alert('Please fill all event fields.');
        return;
    }

    let eventExists = false;
    currentEvents = currentEvents.map(event => {
        if (event.id === id) {
            eventExists = true;
            return new Event(id, title, date, description);
        }
        return event;
    });

    if (!eventExists) {
        currentEvents.push(new Event(id, title, date, description));
    }

    saveData();
    renderEvents();
    alert('Event saved successfully!');
    // Clear form
    $eventIdInput.val('');
    $eventTitleInput.val('');
    $eventDateInput.val('');
    $eventDescriptionInput.val('');
}

function addUpdateStory() {
    const id = $storyIdInput.val() ? parseInt($storyIdInput.val()) : Date.now();
    const title = $storyTitleInput.val().trim();
    const content = $storyContentInput.val().trim();
    const author = $storyAuthorInput.val().trim();

    if (!title || !content || !author) {
        alert('Please fill all story fields.');
        return;
    }

    let storyExists = false;
    currentSuccessStories = currentSuccessStories.map(story => {
        if (story.id === id) {
            storyExists = true;
            return new SuccessStory(id, title, content, author);
        }
        return story;
    });

    if (!storyExists) {
        currentSuccessStories.push(new SuccessStory(id, title, content, author));
    }

    saveData();
    renderSuccessStories();
    alert('Success story saved successfully!');
    // Clear form
    $storyIdInput.val('');
    $storyTitleInput.val('');
    $storyContentInput.val('');
    $storyAuthorInput.val('');
}

function emailSuccessStories() {
    // THIS IS A CLIENT-SIDE SIMULATION ONLY.
    // In a real application, this would involve sending data to a backend server
    // which then handles actual email dispatch using a mail service (e.g., SendGrid, Mailgun).
    // JavaScript in the browser CANNOT send emails directly for security reasons.

    const allStories = currentSuccessStories.map(story => `${story.title} - ${story.author}:\n"${story.content}"`).join('\n\n---\n\n');
    const subject = encodeURIComponent("Exciting Success Stories from MLSC VIT Pune!");
    const body = encodeURIComponent(`Dear VIT Student,\n\nCheck out the latest achievements from MLSC:\n\n${allStories}\n\nVisit our website to learn more: http://localhost:5500/ (This URL might vary based on your Live Server port)\n\nBest regards,\nMLSC VIT Pune`);

    alert("Simulating email dispatch:\n\nSubject: " + decodeURIComponent(subject) + "\n\nBody (truncated for alert):\n" + decodeURIComponent(body).substring(0, 500) + "...\n\n(A real application would send this via a secure server-side process, not directly from the browser.)");
    $emailStatus.text("Email dispatch simulated successfully!").show();
    setTimeout(() => $emailStatus.hide().text(''), 3000);
}


// --- Event Listeners (using jQuery's .on() method) ---
$(document).ready(function() {
    loadData(); // Load data when the page loads
    renderAboutUs(); // Render initial about us content
    renderCommittee();
    renderEvents();
    renderSuccessStories();

    $toggleAdminPanelBtn.on('click', showAdminPanel);
    $closeAdminPanelBtn.on('click', hideAdminPanel);
    $adminLoginBtn.on('click', loginAdmin);
    $adminLogoutBtn.on('click', logoutAdmin);
    $addUpdateMemberBtn.on('click', addUpdateMember);
    $addUpdateEventBtn.on('click', addUpdateEvent);
    $addUpdateStoryBtn.on('click', addUpdateStory);
    $emailStoriesBtn.on('click', emailSuccessStories);

    // Enable editing existing content by clicking on it (CSS Selectors for interaction)
    // Using event delegation with .on() for dynamically added elements
    $coreTeamGrid.on('click', '.team-member', function() {
        if ($adminContent.is(':visible')) { // Only if admin is logged in
            const memberId = parseInt($(this).data('id'));
            const member = currentCommittee.find(m => m.id === memberId);
            if (member) {
                $memberIdInput.val(member.id);
                $memberNameInput.val(member.name);
                $memberRoleInput.val(member.role);
                $memberImageInput.val(member.imageUrl);
                alert(`Editing member: ${member.name}`);
            }
        }
    });

    $eventsGrid.on('click', '.event-card', function() {
        if ($adminContent.is(':visible')) {
            const eventId = parseInt($(this).data('id'));
            const event = currentEvents.find(e => e.id === eventId);
            if (event) {
                $eventIdInput.val(event.id);
                $eventTitleInput.val(event.title);
                $eventDateInput.val(event.date);
                $eventDescriptionInput.val(event.description);
                alert(`Editing event: ${event.title}`);
            }
        }
    });

    $successStoriesGrid.on('click', '.story-card', function() {
        if ($adminContent.is(':visible')) {
            const storyId = parseInt($(this).data('id'));
            const story = currentSuccessStories.find(s => s.id === storyId);
            if (story) {
                $storyIdInput.val(story.id);
                $storyTitleInput.val(story.title);
                $storyContentInput.val(story.content);
                $storyAuthorInput.val(story.author);
                alert(`Editing story: ${story.title}`);
            }
        }
    });
});