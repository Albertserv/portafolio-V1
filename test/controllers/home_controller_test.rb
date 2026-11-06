require "test_helper"

class HomeControllerTest < ActionDispatch::IntegrationTest
  test "muestra la portada con todas las secciones y proyectos" do
    get root_url
    assert_response :success

    %w[inicio proyectos stack experiencia sobre-mi contacto].each do |id|
      assert_select "section##{id}"
    end
    Portafolio::PROYECTOS.each do |p|
      assert_select "article##{p[:slug]} .project-name", text: p[:nombre]
    end
    assert_select "form[action='#{contact_path}']"
  end
end
