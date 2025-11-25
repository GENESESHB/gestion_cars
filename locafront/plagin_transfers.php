<?php
/*
Plugin Name: Airport Transfer Manager
Description: Manage airport transfer vehicles and booking form with price calculation and email notifications.
Version: 1.8
Author: Your Name
Text Domain: airport-transfer-manager
*/

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Simple currency helper (MAD)
 */
function atm_get_currency_label() {
    return 'MAD';
}
function atm_format_price( $price ) {
    return number_format( (float) $price, 2 ) . ' ' . atm_get_currency_label();
}

/**
 * Register custom post type for Vehicles
 */
function atm_register_post_type() {
    $labels = array(
        'name'               => 'Vehicles',
        'singular_name'      => 'Vehicle',
        'add_new'            => 'Add New Vehicle',
        'add_new_item'       => 'Add New Vehicle',
        'edit_item'          => 'Edit Vehicle',
        'new_item'           => 'New Vehicle',
        'view_item'          => 'View Vehicle',
        'search_items'       => 'Search Vehicles',
        'not_found'          => 'No vehicles found',
        'not_found_in_trash' => 'No vehicles found in Trash',
        'menu_name'          => 'Airport Vehicles',
    );

    $args = array(
        'labels'             => $labels,
        'public'             => false,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'menu_icon'          => 'dashicons-car',
        'supports'           => array( 'title', 'editor', 'thumbnail' ),
    );

    register_post_type( 'atm_vehicle', $args );
}
add_action( 'init', 'atm_register_post_type' );

/**
 * Add meta boxes for Vehicle details
 */
function atm_register_meta_boxes() {
    add_meta_box(
        'atm_vehicle_details',
        'Vehicle Details & Routes',
        'atm_vehicle_details_meta_box_callback',
        'atm_vehicle',
        'normal',
        'high'
    );
}
add_action( 'add_meta_boxes', 'atm_register_meta_boxes' );

/**
 * Meta box HTML (DYNAMIC routes + "Add Route" button)
 */
function atm_vehicle_details_meta_box_callback( $post ) {
    wp_nonce_field( 'atm_save_vehicle_meta', 'atm_vehicle_nonce' );

    $capacity = get_post_meta( $post->ID, 'atm_capacity', true );
    $luggage  = get_post_meta( $post->ID, 'atm_luggage', true );
    $routes   = get_post_meta( $post->ID, 'atm_routes', true );

    if ( ! is_array( $routes ) ) {
        $routes = array();
    }

    ?>
    <p>
        <label for="atm_capacity"><strong>Capacity (number of passengers)</strong></label><br>
        <input type="number" name="atm_capacity" id="atm_capacity" value="<?php echo esc_attr( $capacity ); ?>" min="1" style="width: 120px;">
    </p>

    <p>
        <label for="atm_luggage"><strong>Luggage capacity (number of bags)</strong></label><br>
        <input type="number" name="atm_luggage" id="atm_luggage" value="<?php echo esc_attr( $luggage ); ?>" min="0" style="width: 120px;">
    </p>

    <hr>
    <h3>Routes & Prices</h3>
    <p>Add all the routes for this vehicle. Examples:</p>
    <ul style="margin-left:18px;">
        <li>Casablanca → Rabat | One-way: 140 | Return: 140</li>
        <li>Rabat → Casablanca | One-way: 140 | Return: 140</li>
    </ul>
    <p>
        For <strong>Go &amp; Return</strong>, the booking price will be:
        <strong>one-way price + return price</strong>.
        If the return price is empty, it will use <strong>one-way × 2</strong>.
    </p>

    <table class="widefat atm-routes-table">
        <thead>
            <tr>
                <th>Pickup Location</th>
                <th>Dropoff Location</th>
                <th>One-way Price (<?php echo esc_html( atm_get_currency_label() ); ?>)</th>
                <th>Return Price (second leg)</th>
            </tr>
        </thead>
        <tbody id="atm-routes-body">
        <?php
        // At least 1 row visible
        $num_rows = max( 1, count( $routes ) );

        for ( $i = 0; $i < $num_rows; $i++ ) {
            $pickup      = isset( $routes[ $i ]['pickup'] ) ? $routes[ $i ]['pickup'] : '';
            $dropoff     = isset( $routes[ $i ]['dropoff'] ) ? $routes[ $i ]['dropoff'] : '';
            $one_way     = isset( $routes[ $i ]['one_way'] ) ? $routes[ $i ]['one_way'] : '';
            $return_trip = isset( $routes[ $i ]['return'] ) ? $routes[ $i ]['return'] : '';
            ?>
            <tr>
                <td>
                    <input type="text"
                           name="atm_route_pickup[]"
                           value="<?php echo esc_attr( $pickup ); ?>"
                           placeholder="e.g. Casablanca"
                           style="width: 100%;">
                </td>
                <td>
                    <input type="text"
                           name="atm_route_dropoff[]"
                           value="<?php echo esc_attr( $dropoff ); ?>"
                           placeholder="e.g. Rabat"
                           style="width: 100%;">
                </td>
                <td>
                    <input type="number"
                           step="0.01"
                           min="0"
                           name="atm_route_one_way[]"
                           value="<?php echo esc_attr( $one_way ); ?>"
                           placeholder="e.g. 140"
                           style="width: 100%;">
                </td>
                <td>
                    <input type="number"
                           step="0.01"
                           min="0"
                           name="atm_route_return[]"
                           value="<?php echo esc_attr( $return_trip ); ?>"
                           placeholder="e.g. 140"
                           style="width: 100%;">
                </td>
            </tr>
            <?php
        }
        ?>
        </tbody>
    </table>

    <p style="margin-top:10px;">
        <button type="button" class="button" id="atm-add-route">+ Add Route</button>
    </p>

    <script>
    (function() {
        document.addEventListener('DOMContentLoaded', function() {
            var btn  = document.getElementById('atm-add-route');
            var body = document.getElementById('atm-routes-body');
            if (!btn || !body) return;

            btn.addEventListener('click', function(e) {
                e.preventDefault();
                var rows = body.querySelectorAll('tr');
                if (!rows.length) {
                    return;
                }

                var templateRow = rows[rows.length - 1].cloneNode(true);
                var inputs = templateRow.querySelectorAll('input');
                inputs.forEach(function(input) {
                    input.value = '';
                });
                body.appendChild(templateRow);
            });
        });
    })();
    </script>
    <?php
}

/**
 * Save vehicle meta
 */
function atm_save_vehicle_meta( $post_id ) {
    // Security
    if ( ! isset( $_POST['atm_vehicle_nonce'] ) ) {
        return;
    }
    if ( ! wp_verify_nonce( $_POST['atm_vehicle_nonce'], 'atm_save_vehicle_meta' ) ) {
        return;
    }
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
    }
    if ( ! current_user_can( 'edit_post', $post_id ) ) {
        return;
    }

    // Capacity & luggage
    $capacity = isset( $_POST['atm_capacity'] ) ? intval( $_POST['atm_capacity'] ) : '';
    $luggage  = isset( $_POST['atm_luggage'] ) ? intval( $_POST['atm_luggage'] ) : '';

    update_post_meta( $post_id, 'atm_capacity', $capacity );
    update_post_meta( $post_id, 'atm_luggage', $luggage );

    // Routes
    $pickups  = isset( $_POST['atm_route_pickup'] ) ? (array) $_POST['atm_route_pickup'] : array();
    $dropoffs = isset( $_POST['atm_route_dropoff'] ) ? (array) $_POST['atm_route_dropoff'] : array();
    $oneways  = isset( $_POST['atm_route_one_way'] ) ? (array) $_POST['atm_route_one_way'] : array();
    $returns  = isset( $_POST['atm_route_return'] ) ? (array) $_POST['atm_route_return'] : array();

    $routes = array();
    $count  = max( count( $pickups ), count( $dropoffs ), count( $oneways ), count( $returns ) );

    for ( $i = 0; $i < $count; $i++ ) {
        $pickup  = isset( $pickups[ $i ] ) ? sanitize_text_field( $pickups[ $i ] ) : '';
        $dropoff = isset( $dropoffs[ $i ] ) ? sanitize_text_field( $dropoffs[ $i ] ) : '';
        $one_way = isset( $oneways[ $i ] ) ? floatval( $oneways[ $i ] ) : 0;
        $return  = isset( $returns[ $i ] ) ? floatval( $returns[ $i ] ) : 0;

        if ( $pickup !== '' && $dropoff !== '' ) {
            $routes[] = array(
                'pickup'   => $pickup,
                'dropoff'  => $dropoff,
                'one_way'  => $one_way,
                'return'   => $return,
            );
        }
    }

    update_post_meta( $post_id, 'atm_routes', $routes );
}
add_action( 'save_post_atm_vehicle', 'atm_save_vehicle_meta' );

/**
 * Helper: get all unique locations from all vehicles
 */
function atm_get_all_locations() {
    $locations = array();

    $vehicles = get_posts( array(
        'post_type'      => 'atm_vehicle',
        'posts_per_page' => -1,
        'post_status'    => 'publish',
    ) );

    foreach ( $vehicles as $vehicle ) {
        $routes = get_post_meta( $vehicle->ID, 'atm_routes', true );
        if ( ! is_array( $routes ) ) {
            continue;
        }

        foreach ( $routes as $route ) {
            if ( ! empty( $route['pickup'] ) ) {
                $locations[] = $route['pickup'];
            }
            if ( ! empty( $route['dropoff'] ) ) {
                $locations[] = $route['dropoff'];
            }
        }
    }

    $locations = array_unique( $locations );
    sort( $locations );

    return $locations;
}

/**
 * Helper: find price for a given vehicle, route, and trip type
 * trip_type: 'one_way' or 'roundtrip'
 * For roundtrip: price = one_way + return_price (or one_way * 2 if return_price empty)
 */
function atm_get_price_for_vehicle_route( $vehicle_id, $pickup, $dropoff, $trip_type = 'one_way' ) {
    $routes = get_post_meta( $vehicle_id, 'atm_routes', true );
    if ( ! is_array( $routes ) ) {
        return false;
    }

    foreach ( $routes as $route ) {
        if (
            isset( $route['pickup'], $route['dropoff'] ) &&
            strtolower( trim( $route['pickup'] ) ) === strtolower( trim( $pickup ) ) &&
            strtolower( trim( $route['dropoff'] ) ) === strtolower( trim( $dropoff ) )
        ) {
            $one_way     = isset( $route['one_way'] ) ? floatval( $route['one_way'] ) : 0;
            $return_part = isset( $route['return'] ) ? floatval( $route['return'] ) : 0;

            if ( $trip_type === 'roundtrip' ) {
                if ( $return_part <= 0 ) {
                    // If no return price given, assume same as one-way both directions
                    return $one_way * 2;
                }
                return $one_way + $return_part;
            } else {
                return $one_way;
            }
        }
    }

    return false;
}

/**
 * Front-end CSS (green style #44b50c)
 */
function atm_get_frontend_css() {
    return '
    .atm-booking-form,
    .atm-step2-form,
    .atm-step3-form {
        max-width: 900px;
        margin: 20px auto;
        padding: 20px 24px;
        background: #ffffff;
        border-radius: 18px;
        box-shadow: 0 14px 30px rgba(0,0,0,0.08);
        font-family: inherit;
    }
    .atm-booking-form h3,
    .atm-step2-form h3,
    .atm-step3-form h3 {
        margin-top: 0;
        color: #111111;
    }
    .atm-booking-form label,
    .atm-step2-form label,
    .atm-step3-form label {
        font-weight: 500;
        color: #333333;
    }
    .atm-booking-form input[type="date"],
    .atm-booking-form input[type="time"],
    .atm-booking-form select,
    .atm-step2-form input[type="text"],
    .atm-step2-form input[type="email"],
    .atm-step2-form input[type="tel"],
    .atm-step2-form input[type="number"],
    .atm-step2-form select,
    .atm-step3-form input[type="text"],
    .atm-step3-form input[type="email"],
    .atm-step3-form input[type="tel"],
    .atm-step3-form input[type="number"],
    .atm-step3-form textarea,
    .atm-step3-form select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #dddddd;
        border-radius: 10px;
        margin-top: 4px;
        font-size: 14px;
        box-sizing: border-box;
    }
    .atm-booking-form input:focus,
    .atm-booking-form select:focus,
    .atm-step2-form input:focus,
    .atm-step2-form select:focus,
    .atm-step3-form input:focus,
    .atm-step3-form select:focus,
    .atm-step3-form textarea:focus {
        outline: none;
        border-color: #44b50c;
        box-shadow: 0 0 0 1px rgba(68,181,12,0.3);
    }
    .atm-radio-group {
        display: flex;
        gap: 16px;
        margin-top: 4px;
        flex-wrap: wrap;
    }
    .atm-radio-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 999px;
        border: 1px solid #dddddd;
        cursor: pointer;
        font-size: 14px;
        transition: all .2s;
        background: #ffffff;
    }
    .atm-radio-pill input {
        accent-color: #44b50c;
    }
    .atm-radio-pill:hover {
        border-color: #44b50c;
        background: rgba(68,181,12,0.04);
    }
    .atm-booking-form button.button-primary,
    .atm-step2-form button.button-primary,
    .atm-step3-form button.button-primary {
        background: #44b50c;
        border-color: #44b50c;
        border-radius: 999px;
        padding: 10px 24px;
        font-weight: 600;
        transition: background .2s, transform .1s, box-shadow .2s;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 13px;
    }
    .atm-booking-form button.button-primary:hover,
    .atm-step2-form button.button-primary:hover,
    .atm-step3-form button.button-primary:hover {
        background: #3aa008;
        border-color: #3aa008;
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(68,181,12,0.35);
    }
    .atm-summary {
        padding: 12px 16px;
        border-radius: 12px;
        background: #f5fff0;
        border: 1px solid rgba(68,181,12,0.3);
        margin-bottom: 16px;
        font-size: 14px;
    }
    .atm-summary strong {
        color: #44b50c;
    }
    .atm-vehicle-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        gap: 16px;
        margin: 20px 0;
    }
    .atm-vehicle-card {
        display: block;
        background: #ffffff;
        border-radius: 16px;
        border: 1px solid #e4e4e4;
        overflow: hidden;
        text-decoration: none;
        cursor: pointer;
        transition: box-shadow .2s, transform .1s, border-color .2s;
        position: relative;
        padding: 0;
    }
    .atm-vehicle-card:hover {
        box-shadow: 0 12px 26px rgba(0,0,0,0.08);
        transform: translateY(-2px);
        border-color: rgba(68,181,12,0.6);
    }
    .atm-vehicle-card input[type="radio"] {
        position: absolute;
        top: 10px;
        left: 10px;
        transform: scale(1.1);
        accent-color: #44b50c;
        z-index: 2;
    }
    .atm-vehicle-media {
        width: 100%;
        height: 140px;
        background: #f5f5f5;
        overflow: hidden;
    }
    .atm-vehicle-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
    .atm-vehicle-body {
        padding: 12px 14px 14px;
        font-size: 14px;
    }
    .atm-vehicle-title {
        font-weight: 600;
        margin-bottom: 4px;
    }
    .atm-vehicle-meta {
        font-size: 13px;
        color: #666666;
        margin-bottom: 8px;
    }
    .atm-vehicle-price {
        font-weight: 700;
        color: #44b50c;
        font-size: 15px;
    }
    .atm-booking-confirmation {
        max-width: 680px;
        margin: 20px auto;
        padding: 22px 24px;
        background: #f5fff0;
        border-radius: 18px;
        border: 1px solid rgba(68,181,12,0.3);
        box-shadow: 0 10px 24px rgba(0,0,0,0.06);
    }
    .atm-booking-confirmation h3 {
        margin-top: 0;
        color: #1a2b16;
    }
    .atm-step3-layout {
        display: grid;
        grid-template-columns: minmax(0, 2fr) minmax(0, 1.4fr);
        gap: 24px;
    }
    @media (max-width: 768px) {
        .atm-step3-layout {
            grid-template-columns: 1fr;
        }
    }
    .atm-order-box {
        border-radius: 16px;
        border: 1px solid #e4e4e4;
        padding: 14px 16px;
        background: #fafafa;
        font-size: 14px;
    }
    .atm-order-box table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
    }
    .atm-order-box th,
    .atm-order-box td {
        padding: 6px 4px;
        text-align: left;
    }
    .atm-order-box tr + tr td,
    .atm-order-box tr + tr th {
        border-top: 1px solid #e0e0e0;
    }
    .atm-order-total {
        font-weight: 700;
    }
    .atm-payment-methods {
        margin-top: 10px;
        border-radius: 12px;
        border: 1px solid #e4e4e4;
        padding: 10px 12px;
        background: #ffffff;
    }
    .atm-payment-methods label {
        display: block;
        margin-bottom: 8px;
        cursor: pointer;
    }
    .atm-payment-methods small {
        display: block;
        color: #666;
        margin-left: 22px;
        margin-top: 2px;
    }
    .atm-btn-row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    ';
}

/**
 * Shortcode: [airport_transfer_manager]
 */
function atm_booking_form_shortcode( $atts ) {
    static $css_printed = false;

    ob_start();

    // Print inline CSS only once
    if ( ! $css_printed ) {
        echo '<style>' . atm_get_frontend_css() . '</style>';
        $css_printed = true;
    }

    $step = isset( $_POST['atm_step'] ) ? sanitize_text_field( $_POST['atm_step'] ) : '0';

    // Back buttons logic
    if ( $step === '2' && isset( $_POST['atm_back_to_0'] ) ) {
        $step = '0';
    }
    if ( $step === '3' && isset( $_POST['atm_back_to_1'] ) ) {
        $step = '1';
    }

    // Prefill values for Step 0 when coming back
    $prefill_date      = isset( $_POST['atm_date'] ) ? sanitize_text_field( $_POST['atm_date'] ) : '';
    $prefill_time      = isset( $_POST['atm_time'] ) ? sanitize_text_field( $_POST['atm_time'] ) : '';
    $prefill_trip_type = isset( $_POST['atm_trip_type'] ) ? sanitize_text_field( $_POST['atm_trip_type'] ) : 'one_way';
    $prefill_pickup    = isset( $_POST['atm_pickup'] ) ? sanitize_text_field( $_POST['atm_pickup'] ) : '';
    $prefill_dropoff   = isset( $_POST['atm_dropoff'] ) ? sanitize_text_field( $_POST['atm_dropoff'] ) : '';

    // STEP 3: process booking (send emails, thank you)
    if ( $step === '3' && isset( $_POST['atm_step3_nonce'] ) && wp_verify_nonce( $_POST['atm_step3_nonce'], 'atm_step3_action' ) ) {

        $date      = isset( $_POST['atm_date'] ) ? sanitize_text_field( $_POST['atm_date'] ) : '';
        $time      = isset( $_POST['atm_time'] ) ? sanitize_text_field( $_POST['atm_time'] ) : '';
        $trip_type = isset( $_POST['atm_trip_type'] ) ? sanitize_text_field( $_POST['atm_trip_type'] ) : 'one_way';
        $pickup    = isset( $_POST['atm_pickup'] ) ? sanitize_text_field( $_POST['atm_pickup'] ) : '';
        $dropoff   = isset( $_POST['atm_dropoff'] ) ? sanitize_text_field( $_POST['atm_dropoff'] ) : '';
        $vehicle_id = isset( $_POST['atm_vehicle_id'] ) ? intval( $_POST['atm_vehicle_id'] ) : 0;

        // Billing fields
        $billing_first_name = isset( $_POST['atm_billing_first_name'] ) ? sanitize_text_field( $_POST['atm_billing_first_name'] ) : '';
        $billing_company    = isset( $_POST['atm_billing_company'] ) ? sanitize_text_field( $_POST['atm_billing_company'] ) : '';
        $billing_country    = isset( $_POST['atm_billing_country'] ) ? sanitize_text_field( $_POST['atm_billing_country'] ) : '';
        $billing_address_1  = isset( $_POST['atm_billing_address_1'] ) ? sanitize_text_field( $_POST['atm_billing_address_1'] ) : '';
        $billing_address_2  = isset( $_POST['atm_billing_address_2'] ) ? sanitize_text_field( $_POST['atm_billing_address_2'] ) : '';
        $billing_city       = isset( $_POST['atm_billing_city'] ) ? sanitize_text_field( $_POST['atm_billing_city'] ) : '';
        $billing_postcode   = isset( $_POST['atm_billing_postcode'] ) ? sanitize_text_field( $_POST['atm_billing_postcode'] ) : '';
        $billing_phone      = isset( $_POST['atm_billing_phone'] ) ? sanitize_text_field( $_POST['atm_billing_phone'] ) : '';
        $billing_email      = isset( $_POST['atm_billing_email'] ) ? sanitize_email( $_POST['atm_billing_email'] ) : '';
        $order_notes        = isset( $_POST['atm_order_notes'] ) ? sanitize_textarea_field( $_POST['atm_order_notes'] ) : '';
        $payment_method     = isset( $_POST['atm_payment_method'] ) ? sanitize_text_field( $_POST['atm_payment_method'] ) : '';

        $price = atm_get_price_for_vehicle_route( $vehicle_id, $pickup, $dropoff, $trip_type );
        $vehicle_title = get_the_title( $vehicle_id );

        if ( ! $price || ! $vehicle_title || ! is_email( $billing_email ) || empty( $billing_first_name ) ) {
            echo '<p>Something went wrong with your booking. Please go back and try again.</p>';
            return ob_get_clean();
        }

        $trip_label      = ( $trip_type === 'roundtrip' ) ? 'Go & Return' : 'One-way';
        $formatted_price = atm_format_price( $price );

        // Payment label
        $payment_label = '';
        if ( $payment_method === 'bank' ) {
            $payment_label = 'Virement bancaire';
        } elseif ( $payment_method === 'cash' ) {
            $payment_label = 'Paiement sur place (Cash ou TPE)';
        } else {
            $payment_label = 'Not specified';
        }

        // === SIMPLE EMAIL SOLUTION WITH DEBUG ===
        $blogname = get_bloginfo('name');
        $admin_email = 'polypusmarketing@gmail.com';
        
        // Create email content
        $email_content = "NEW AIRPORT TRANSFER BOOKING\n";
        $email_content .= "===========================\n\n";
        
        $email_content .= "CLIENT INFORMATION:\n";
        $email_content .= "-------------------\n";
        $email_content .= "Name: " . $billing_first_name . "\n";
        $email_content .= "Email: " . $billing_email . "\n";
        $email_content .= "Phone: " . $billing_phone . "\n";
        $email_content .= "Company: " . $billing_company . "\n\n";
        
        $email_content .= "ADDRESS:\n";
        $email_content .= $billing_address_1 . " " . $billing_address_2 . "\n";
        $email_content .= $billing_city . ", " . $billing_postcode . "\n";
        $email_content .= $billing_country . "\n\n";
        
        $email_content .= "TRIP DETAILS:\n";
        $email_content .= "-------------\n";
        $email_content .= "From: " . $pickup . "\n";
        $email_content .= "To: " . $dropoff . "\n";
        $email_content .= "Date: " . $date . "\n";
        $email_content .= "Time: " . $time . "\n";
        $email_content .= "Trip Type: " . $trip_label . "\n";
        $email_content .= "Vehicle: " . $vehicle_title . "\n";
        $email_content .= "Total Price: " . $formatted_price . "\n";
        $email_content .= "Payment Method: " . $payment_label . "\n\n";
        
        if (!empty($order_notes)) {
            $email_content .= "CLIENT NOTES:\n";
            $email_content .= "-------------\n";
            $email_content .= $order_notes . "\n\n";
        }
        
        $email_content .= "================\n";
        $email_content .= "Booking received: " . date('Y-m-d H:i:s') . "\n";
        $email_content .= "IP: " . $_SERVER['REMOTE_ADDR'] . "\n";

        // Simple headers
        $headers = array(
            'From: ' . $blogname . ' <noreply@' . $_SERVER['HTTP_HOST'] . '>',
            'Content-Type: text/plain; charset=UTF-8',
            'Reply-To: ' . $billing_email
        );

        // Try to send email with detailed error handling
        $email_sent = false;
        $email_error = '';
        
        // Debug: Log email attempt
        error_log('ATM Plugin: Attempting to send booking email to: ' . $admin_email);
        
        try {
            $email_sent = wp_mail($admin_email, 'New Airport Transfer Booking - ' . $billing_first_name, $email_content, $headers);
            
            if ($email_sent) {
                error_log('ATM Plugin: Email sent successfully to: ' . $admin_email);
            } else {
                $email_error = 'WordPress wp_mail() function returned false';
                error_log('ATM Plugin: Email failed to send - wp_mail returned false');
            }
        } catch (Exception $e) {
            $email_error = 'Exception: ' . $e->getMessage();
            error_log('ATM Plugin: Email exception: ' . $e->getMessage());
        }

        // Display confirmation with debug info
        echo '<div class="atm-booking-confirmation">';
        echo '<h3>✅ Booking Received Successfully!</h3>';
        echo '<p><strong>Thank you, ' . esc_html($billing_first_name) . '!</strong></p>';
        echo '<p>Your airport transfer has been booked successfully.</p>';
        
        echo '<div style="background: white; padding: 15px; border-radius: 10px; margin: 15px 0; border: 2px solid #44b50c;">';
        echo '<h4>📋 Booking Summary:</h4>';
        echo '<p><strong>Route:</strong> ' . esc_html($pickup) . ' → ' . esc_html($dropoff) . '</p>';
        echo '<p><strong>Date & Time:</strong> ' . esc_html($date) . ' at ' . esc_html($time) . '</p>';
        echo '<p><strong>Vehicle:</strong> ' . esc_html($vehicle_title) . '</p>';
        echo '<p><strong>Trip Type:</strong> ' . esc_html($trip_label) . '</p>';
        echo '<p><strong>Total Amount:</strong> <span style="color: #44b50c; font-weight: bold;">' . esc_html($formatted_price) . '</span></p>';
        echo '</div>';
        
        echo '<p>📞 <strong>Our team will contact you at ' . esc_html($billing_phone) . ' within 24 hours to confirm your transfer.</strong></p>';
        
        // Email status and debug information
        echo '<div style="margin-top: 20px; padding: 15px; background: ' . ($email_sent ? '#d4edda' : '#f8d7da') . '; border-radius: 8px; border: 1px solid ' . ($email_sent ? '#c3e6cb' : '#f5c6cb') . ';">';
        echo '<h4>📧 Email Status:</h4>';
        
        if ($email_sent) {
            echo '<p style="color: #155724; margin: 0;"><strong>✅ Email sent successfully to our team!</strong></p>';
            echo '<p style="color: #155724; margin: 5px 0 0 0;">A confirmation has been sent to: ' . esc_html($admin_email) . '</p>';
        } else {
            echo '<p style="color: #721c24; margin: 0;"><strong>⚠️ Email could not be sent automatically</strong></p>';
            echo '<p style="color: #721c24; margin: 5px 0 0 0;">Your booking has been recorded. We will contact you shortly.</p>';
            if ($email_error) {
                echo '<p style="color: #721c24; margin: 5px 0 0 0; font-size: 12px;">Error: ' . esc_html($email_error) . '</p>';
            }
        }
        echo '</div>';

        // Debug information for admin users
        if (current_user_can('manage_options')) {
            echo '<div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-radius: 8px; border: 1px solid #b3d9ff;">';
            echo '<h4>🐛 Debug Information (Admin Only):</h4>';
            
            echo '<p><strong>Email Details:</strong></p>';
            echo '<ul style="margin: 10px 0; font-size: 13px;">';
            echo '<li><strong>To:</strong> ' . esc_html($admin_email) . '</li>';
            echo '<li><strong>From:</strong> ' . $blogname . ' &lt;noreply@' . $_SERVER['HTTP_HOST'] . '&gt;</li>';
            echo '<li><strong>Reply-To:</strong> ' . esc_html($billing_email) . '</li>';
            echo '<li><strong>Sent:</strong> ' . ($email_sent ? 'Yes' : 'No') . '</li>';
            if (!$email_sent && $email_error) {
                echo '<li><strong>Error:</strong> ' . esc_html($email_error) . '</li>';
            }
            echo '</ul>';
            
            echo '<p><strong>Email Content Preview:</strong></p>';
            echo '<textarea style="width: 100%; height: 200px; font-family: monospace; font-size: 12px; background: #f8f9fa; border: 1px solid #dee2e6; padding: 10px; border-radius: 4px;" readonly>';
            echo esc_textarea($email_content);
            echo '</textarea>';
            
            echo '<p style="font-size: 12px; color: #666; margin-top: 10px;">';
            echo 'This debug information is only visible to administrators.';
            echo '</p>';
            echo '</div>';
        }
        
        echo '</div>';

        return ob_get_clean();
    }

    // STEP 2: billing form + order summary
    if ( $step === '2' && isset( $_POST['atm_step2_nonce'] ) && wp_verify_nonce( $_POST['atm_step2_nonce'], 'atm_step2_action' ) ) {

        $date      = isset( $_POST['atm_date'] ) ? sanitize_text_field( $_POST['atm_date'] ) : '';
        $time      = isset( $_POST['atm_time'] ) ? sanitize_text_field( $_POST['atm_time'] ) : '';
        $trip_type = isset( $_POST['atm_trip_type'] ) ? sanitize_text_field( $_POST['atm_trip_type'] ) : 'one_way';
        $pickup    = isset( $_POST['atm_pickup'] ) ? sanitize_text_field( $_POST['atm_pickup'] ) : '';
        $dropoff   = isset( $_POST['atm_dropoff'] ) ? sanitize_text_field( $_POST['atm_dropoff'] ) : '';
        $vehicle_id = isset( $_POST['atm_vehicle_id'] ) ? intval( $_POST['atm_vehicle_id'] ) : 0;

        $vehicle_title = get_the_title( $vehicle_id );
        $price         = atm_get_price_for_vehicle_route( $vehicle_id, $pickup, $dropoff, $trip_type );

        if ( ! $vehicle_title || ! $price ) {
            echo '<p>Something went wrong. Please go back and try again.</p>';
            return ob_get_clean();
        }

        $trip_label      = ( $trip_type === 'roundtrip' ) ? 'Go & Return' : 'One-way';
        $formatted_price = atm_format_price( $price );

        ?>
        <form method="post" class="atm-step3-form">
            <?php wp_nonce_field( 'atm_step3_action', 'atm_step3_nonce' ); ?>
            <input type="hidden" name="atm_step" value="3">

            <input type="hidden" name="atm_date" value="<?php echo esc_attr( $date ); ?>">
            <input type="hidden" name="atm_time" value="<?php echo esc_attr( $time ); ?>">
            <input type="hidden" name="atm_trip_type" value="<?php echo esc_attr( $trip_type ); ?>">
            <input type="hidden" name="atm_pickup" value="<?php echo esc_attr( $pickup ); ?>">
            <input type="hidden" name="atm_dropoff" value="<?php echo esc_attr( $dropoff ); ?>">
            <input type="hidden" name="atm_vehicle_id" value="<?php echo esc_attr( $vehicle_id ); ?>">

            <div class="atm-summary">
                <strong>Step 3 – Billing details</strong><br>
                You are booking: <?php echo esc_html( $vehicle_title ); ?> (<?php echo esc_html( $trip_label ); ?>)<br>
                Route: <?php echo esc_html( $pickup . ' → ' . $dropoff ); ?><br>
                Date: <?php echo esc_html( $date ); ?> – Time: <?php echo esc_html( $time ); ?><br>
                Total: <strong><?php echo esc_html( $formatted_price ); ?></strong>
            </div>

            <div class="atm-step3-layout">
                <div>
                    <h3>Billing details</h3>

                    <p>
                        <label for="atm_billing_first_name">First name *</label><br>
                        <input type="text" name="atm_billing_first_name" id="atm_billing_first_name" required>
                    </p>
                    <p>
                        <label for="atm_billing_company">Company name (optional)</label><br>
                        <input type="text" name="atm_billing_company" id="atm_billing_company">
                    </p>
                    <p>
                        <label for="atm_billing_country">Country / Region *</label><br>
                        <input type="text" name="atm_billing_country" id="atm_billing_country" value="Morocco" required>
                    </p>
                    <p>
                        <label for="atm_billing_address_1">Street address *</label><br>
                        <input type="text" name="atm_billing_address_1" id="atm_billing_address_1" placeholder="House number and street name" required>
                    </p>
                    <p>
                        <label for="atm_billing_address_2">Apartment, suite, unit, etc. (optional)</label><br>
                        <input type="text" name="atm_billing_address_2" id="atm_billing_address_2" placeholder="Apartment, suite, unit, etc. (optional)">
                    </p>
                    <p>
                        <label for="atm_billing_city">Town / City *</label><br>
                        <input type="text" name="atm_billing_city" id="atm_billing_city" required>
                    </p>
                    <p>
                        <label for="atm_billing_postcode">Postcode / ZIP *</label><br>
                        <input type="text" name="atm_billing_postcode" id="atm_billing_postcode" required>
                    </p>
                    <p>
                        <label for="atm_billing_phone">Phone *</label><br>
                        <input type="text" name="atm_billing_phone" id="atm_billing_phone" required>
                    </p>
                    <p>
                        <label for="atm_billing_email">Email address *</label><br>
                        <input type="email" name="atm_billing_email" id="atm_billing_email" required>
                    </p>
                    <p>
                        <label for="atm_order_notes">Order notes (optional)</label><br>
                        <textarea name="atm_order_notes" id="atm_order_notes" rows="4" placeholder="Notes about your order, e.g. special notes for pickup."></textarea>
                    </p>
                </div>

                <div>
                    <h3>Your order</h3>
                    <div class="atm-order-box">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th style="text-align:right;">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <?php echo esc_html( $vehicle_title ); ?> × 1<br>
                                        <small>
                                            Route: <?php echo esc_html( $pickup . ' → ' . $dropoff ); ?><br>
                                            Date: <?php echo esc_html( $date ); ?><br>
                                            Time: <?php echo esc_html( $time ); ?><br>
                                            Trip: <?php echo esc_html( $trip_label ); ?>
                                        </small>
                                    </td>
                                    <td style="text-align:right;"><?php echo esc_html( $formatted_price ); ?></td>
                                </tr>
                                <tr>
                                    <th>Subtotal</th>
                                    <td style="text-align:right;"><?php echo esc_html( $formatted_price ); ?></td>
                                </tr>
                                <tr class="atm-order-total">
                                    <th>Total</th>
                                    <td style="text-align:right;"><?php echo esc_html( $formatted_price ); ?></td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="atm-payment-methods">
                            <label>
                                <input type="radio" name="atm_payment_method" value="bank" checked>
                                <span>Virement bancaire</span>
                                <small>
                                    Effectuez le paiement directement depuis votre compte bancaire.
                                    Veuillez utiliser l'ID de votre commande comme référence du paiement.
                                </small>
                            </label>
                            <label>
                                <input type="radio" name="atm_payment_method" value="cash">
                                <span>Paiement sur place (Cash ou TPE)</span>
                                <small>
                                    Réglez le montant de votre transfert à votre chauffeur (espèces ou TPE si disponible).
                                </small>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <p style="margin-top:16px;" class="atm-btn-row">
                <button type="submit" name="atm_back_to_1" value="1" class="button">&larr; Back</button>
                <button type="submit" class="button button-primary">Confirm booking</button>
            </p>
        </form>
        <?php

        return ob_get_clean();
    }

    // STEP 1: vehicle list (after search)
    if ( $step === '1' && isset( $_POST['atm_step1_nonce'] ) && wp_verify_nonce( $_POST['atm_step1_nonce'], 'atm_step1_action' ) ) {

        $date      = isset( $_POST['atm_date'] ) ? sanitize_text_field( $_POST['atm_date'] ) : '';
        $time      = isset( $_POST['atm_time'] ) ? sanitize_text_field( $_POST['atm_time'] ) : '';
        $trip_type = isset( $_POST['atm_trip_type'] ) ? sanitize_text_field( $_POST['atm_trip_type'] ) : 'one_way';
        $pickup    = isset( $_POST['atm_pickup'] ) ? sanitize_text_field( $_POST['atm_pickup'] ) : '';
        $dropoff   = isset( $_POST['atm_dropoff'] ) ? sanitize_text_field( $_POST['atm_dropoff'] ) : '';

        echo '<form method="post" class="atm-step2-form">';
        wp_nonce_field( 'atm_step2_action', 'atm_step2_nonce' );
        ?>
        <input type="hidden" name="atm_step" value="2">
        <input type="hidden" name="atm_date" value="<?php echo esc_attr( $date ); ?>">
        <input type="hidden" name="atm_time" value="<?php echo esc_attr( $time ); ?>">
        <input type="hidden" name="atm_trip_type" value="<?php echo esc_attr( $trip_type ); ?>">
        <input type="hidden" name="atm_pickup" value="<?php echo esc_attr( $pickup ); ?>">
        <input type="hidden" name="atm_dropoff" value="<?php echo esc_attr( $dropoff ); ?>">

        <div class="atm-summary">
            <strong>Step 2 – Select your vehicle</strong><br>
            Date: <?php echo esc_html( $date ); ?> – Time: <?php echo esc_html( $time ); ?><br>
            Type: <?php echo esc_html( $trip_type === 'roundtrip' ? 'Go & Return' : 'One-way' ); ?><br>
            Route: <?php echo esc_html( $pickup . ' → ' . $dropoff ); ?>
        </div>

        <h3>Select your vehicle</h3>
        <?php

        $vehicles = get_posts( array(
            'post_type'      => 'atm_vehicle',
            'posts_per_page' => -1,
            'post_status'    => 'publish',
        ) );

        $matching_vehicles = array();

        foreach ( $vehicles as $vehicle ) {
            $price = atm_get_price_for_vehicle_route( $vehicle->ID, $pickup, $dropoff, $trip_type );
            if ( $price !== false && $price > 0 ) {
                $matching_vehicles[] = array(
                    'id'       => $vehicle->ID,
                    'title'    => $vehicle->post_title,
                    'price'    => $price,
                    'capacity' => get_post_meta( $vehicle->ID, 'atm_capacity', true ),
                    'luggage'  => get_post_meta( $vehicle->ID, 'atm_luggage', true ),
                    'image'    => get_the_post_thumbnail_url( $vehicle->ID, 'medium' ),
                );
            }
        }

        if ( empty( $matching_vehicles ) ) {
            echo '<p>No vehicles available for this route. Please try another pickup/dropoff.</p>';
            echo '</form>';
            return ob_get_clean();
        }

        echo '<div class="atm-vehicle-grid">';
        foreach ( $matching_vehicles as $v ) :
            $img = $v['image'] ? $v['image'] : 'https://via.placeholder.com/400x250?text=Vehicle';
            ?>
            <label class="atm-vehicle-card">
                <input type="radio" name="atm_vehicle_id" value="<?php echo esc_attr( $v['id'] ); ?>" required>
                <div class="atm-vehicle-media">
                    <img src="<?php echo esc_url( $img ); ?>" alt="<?php echo esc_attr( $v['title'] ); ?>">
                </div>
                <div class="atm-vehicle-body">
                    <div class="atm-vehicle-title"><?php echo esc_html( $v['title'] ); ?></div>
                    <div class="atm-vehicle-meta">
                        <?php
                        $cap = $v['capacity'] ? intval( $v['capacity'] ) : 0;
                        $lug = $v['luggage'] ? intval( $v['luggage'] ) : 0;
                        $meta_parts = array();
                        if ( $cap ) {
                            $meta_parts[] = $cap . ' pax';
                        }
                        if ( $lug ) {
                            $meta_parts[] = $lug . ' bags';
                        }
                        echo esc_html( implode( ' · ', $meta_parts ) );
                        ?>
                    </div>
                    <div class="atm-vehicle-price">
                        <?php echo esc_html( atm_format_price( $v['price'] ) ); ?>
                    </div>
                </div>
            </label>
            <?php
        endforeach;
        echo '</div>';
        ?>

        <p class="atm-btn-row">
            <button type="submit" name="atm_back_to_0" value="1" class="button">&larr; Back</button>
            <button type="submit" class="button button-primary">Continue to billing</button>
        </p>
        </form>
        <?php

        return ob_get_clean();
    }

    // STEP 0: initial search form
    $locations = atm_get_all_locations();

    if ( empty( $locations ) ) {
        echo '<p>No locations defined yet. Please add routes to your vehicles in the admin.</p>';
        return ob_get_clean();
    }

    ?>
    <form method="post" class="atm-step1-form atm-booking-form">
        <?php wp_nonce_field( 'atm_step1_action', 'atm_step1_nonce' ); ?>
        <input type="hidden" name="atm_step" value="1">

        <h3>Book your airport transfer</h3>

        <p>
            <label for="atm_date">Date</label><br>
            <input type="date" name="atm_date" id="atm_date" required
                   value="<?php echo esc_attr( $prefill_date ); ?>">
        </p>

        <p>
            <label for="atm_time">Departure time</label><br>
            <input type="time" name="atm_time" id="atm_time" required
                   value="<?php echo esc_attr( $prefill_time ); ?>">
        </p>

        <p>
            <label>Trip Type</label><br>
            <div class="atm-radio-group">
                <label class="atm-radio-pill">
                    <input type="radio" name="atm_trip_type" value="one_way"
                        <?php checked( $prefill_trip_type, 'one_way' ); ?>>
                    <span>One-way</span>
                </label>
                <label class="atm-radio-pill">
                    <input type="radio" name="atm_trip_type" value="roundtrip"
                        <?php checked( $prefill_trip_type, 'roundtrip' ); ?>>
                    <span>Go &amp; Return (price = one-way + return)</span>
                </label>
            </div>
        </p>

        <p>
            <label for="atm_pickup">Pickup Location</label><br>
            <select name="atm_pickup" id="atm_pickup" required>
                <option value="">Select pickup</option>
                <?php foreach ( $locations as $loc ) : ?>
                    <option value="<?php echo esc_attr( $loc ); ?>"
                        <?php selected( $prefill_pickup, $loc ); ?>>
                        <?php echo esc_html( $loc ); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </p>

        <p>
            <label for="atm_dropoff">Dropoff Location</label><br>
            <select name="atm_dropoff" id="atm_dropoff" required>
                <option value="">Select dropoff</option>
                <?php foreach ( $locations as $loc ) : ?>
                    <option value="<?php echo esc_attr( $loc ); ?>"
                        <?php selected( $prefill_dropoff, $loc ); ?>>
                        <?php echo esc_html( $loc ); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </p>

        <p>
            <button type="submit" class="button button-primary">Search Vehicles</button>
        </p>
    </form>
    <?php

    return ob_get_clean();
}
add_shortcode( 'airport_transfer_manager', 'atm_booking_form_shortcode' );
