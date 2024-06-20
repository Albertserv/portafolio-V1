require "test_helper"

class HabilidadesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get habilidades_index_url
    assert_response :success
  end

  test "should get new" do
    get habilidades_new_url
    assert_response :success
  end

  test "should get create" do
    get habilidades_create_url
    assert_response :success
  end

  test "should get edit" do
    get habilidades_edit_url
    assert_response :success
  end

  test "should get update" do
    get habilidades_update_url
    assert_response :success
  end

  test "should get destroy" do
    get habilidades_destroy_url
    assert_response :success
  end
end
