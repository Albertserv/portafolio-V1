require "test_helper"

class ExperienciasControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get experiencias_index_url
    assert_response :success
  end

  test "should get new" do
    get experiencias_new_url
    assert_response :success
  end

  test "should get create" do
    get experiencias_create_url
    assert_response :success
  end

  test "should get edit" do
    get experiencias_edit_url
    assert_response :success
  end

  test "should get update" do
    get experiencias_update_url
    assert_response :success
  end

  test "should get destroy" do
    get experiencias_destroy_url
    assert_response :success
  end
end
