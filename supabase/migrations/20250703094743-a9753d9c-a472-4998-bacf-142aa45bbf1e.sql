-- Create sample delivery data for testing the reports
-- First, let's get a vehicle ID and ensure we have the right user
DO $$
DECLARE
    sample_vehicle_id UUID;
    sample_dealership_id UUID;
BEGIN
    -- Get a sample vehicle
    SELECT id INTO sample_vehicle_id FROM vehicles LIMIT 1;
    
    -- Get a sample dealership  
    SELECT id INTO sample_dealership_id FROM dealerships LIMIT 1;
    
    -- Insert sample deliveries if we have vehicles
    IF sample_vehicle_id IS NOT NULL THEN
        INSERT INTO deliveries (
            vehicle_id, 
            operator_id, 
            customer_name, 
            whatsapp_number, 
            consent_to_share,
            framed_image_urls
        ) VALUES 
        (
            sample_vehicle_id,
            'a153e4f8-ce0f-4f91-aef8-a29e5bad8d65', -- Real user from auth logs
            'John Doe',
            '+92-300-1234567',
            true,
            ARRAY['https://via.placeholder.com/800x600/E60012/FFFFFF?text=Sample+Delivery+Photo+1', 'https://via.placeholder.com/800x600/E60012/FFFFFF?text=Sample+Delivery+Photo+2']
        ),
        (
            sample_vehicle_id,
            'a153e4f8-ce0f-4f91-aef8-a29e5bad8d65',
            'Jane Smith', 
            '+92-301-7654321',
            false,
            ARRAY['https://via.placeholder.com/800x600/E60012/FFFFFF?text=Sample+Delivery+Photo+3']
        );
        
        -- Update vehicle as delivered
        UPDATE vehicles SET is_delivered = true WHERE id = sample_vehicle_id;
    END IF;
END $$;