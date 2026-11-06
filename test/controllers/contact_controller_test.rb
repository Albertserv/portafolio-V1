require "test_helper"

class ContactControllerTest < ActionDispatch::IntegrationTest
  test "envía el mail y vuelve a contacto" do
    assert_emails 1 do
      post contact_url, params: { name: "Ana", email: "ana@example.com", message: "Hola" }
    end
    assert_redirected_to root_path(anchor: "contacto")
    assert_match "Mensaje enviado", flash[:notice]
  end

  test "rechaza campos vacíos" do
    assert_no_emails do
      post contact_url, params: { name: "", email: "ana@example.com", message: "Hola" }
    end
    assert_redirected_to root_path(anchor: "contacto")
    assert flash[:alert].present?
  end
end
