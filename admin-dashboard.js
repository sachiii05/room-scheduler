document.addEventListener('DOMContentLoaded', function() {
    loadPendingBookings();
    loadRooms();
});

function loadPendingBookings() {
    const bookingsList = document.querySelector('.bookings-list');
    // Fetch pending bookings from your backend
    // Example display:
    bookingsList.innerHTML = `
        <div class="booking-item">
            <h3>Pending Booking</h3>
            <p>Room: CICS</p>
            <p>Date: 2024-12-10</p>
            <p>User: John Doe</p>
            <div class="booking-actions">
                <button onclick="approveBooking(1)">Approve</button>
                <button onclick="rejectBooking(1)">Reject</button>
            </div>
        </div>
    `;
}

function loadRooms() {
    const roomsList = document.querySelector('.rooms-list');
    // Fetch rooms from your backend
    // Example display:
    roomsList.innerHTML = `
        <div class="room-item">
            <h3>CICS</h3>
            <p>Capacity: 25</p>
            <div class="room-actions">
                <button onclick="editRoom(1)">Edit</button>
                <button onclick="deleteRoom(1)">Delete</button>
            </div>
        </div>
    `;
}

function approveBooking(id) {
    // Implement booking approval logic
}

function rejectBooking(id) {
    // Implement booking rejection logic
}

function editRoom(id) {
    // Implement room editing logic
}

function deleteRoom(id) {
    // Implement room deletion logic
}
